/**
 * Geocoding Service
 * Converts addresses to coordinates and vice versa
 * Supports multiple geocoding providers with progressive address fallback
 */

const axios = require('axios');

class GeocodingService {
    constructor() {
        this.googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY || null;
        this.mapboxApiKey = process.env.MAPBOX_API_KEY || null;
        this.defaultProvider = process.env.GEOCODING_PROVIDER || 'nominatim';
        this.defaultCountry = process.env.DEFAULT_COUNTRY || 'Nigeria';

        // Rate limiting for Nominatim (1 request per second)
        this.lastRequestTime = 0;
        this.requestDelay = 1000;
    }

    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async respectRateLimit() {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        if (timeSinceLastRequest < this.requestDelay) {
            await this.delay(this.requestDelay - timeSinceLastRequest);
        }
        this.lastRequestTime = Date.now();
    }

    /**
     * Build progressively broader address queries when an exact street/house number isn't indexed
     * Example: "9, Temvic Crescent, Ogijo" ->
     *   ["9, Temvic Crescent, Ogijo", "Temvic Crescent, Ogijo", "Ogijo, Nigeria", "Ogijo"]
     */
    buildFallbackQueries(address) {
        const clean = address.trim().replace(/\s+/g, ' ');
        const candidates = [];
        const add = (q) => {
            const trimmed = q.trim().replace(/^[,.\s]+|[,.\s]+$/g, '');
            if (trimmed && !candidates.includes(trimmed)) {
                candidates.push(trimmed);
            }
        };

        add(clean);

        // Strip leading house/plot number (e.g., "No. 9, ..." or "11, ...")
        const withoutNumber = clean.replace(/^(?:no\.?\s*|plot\s*)?\d+[a-zA-Z]?\s*[,/-]?\s*/i, '');
        if (withoutNumber !== clean) {
            add(withoutNumber);
        }

        // Progressively drop the most specific comma-separated parts from the left
        const parts = clean.split(',').map((p) => p.trim()).filter(Boolean);
        for (let i = 1; i < parts.length; i++) {
            const broader = parts.slice(i).join(', ');
            add(broader);
            if (!broader.toLowerCase().includes(this.defaultCountry.toLowerCase())) {
                add(`${broader}, ${this.defaultCountry}`);
            }
        }

        // Also try the full address with default country appended
        if (!clean.toLowerCase().includes(this.defaultCountry.toLowerCase())) {
            add(`${clean}, ${this.defaultCountry}`);
        }

        return candidates;
    }

    async geocodeWithNominatim(address) {
        try {
            await this.respectRateLimit();

            const url = 'https://nominatim.openstreetmap.org/search';
            const response = await axios.get(url, {
                params: {
                    q: address,
                    format: 'json',
                    limit: 1,
                    addressdetails: 1
                },
                headers: {
                    'User-Agent': 'MissingPersonsPlatform/1.0'
                },
                timeout: 10000
            });

            if (response.data && response.data.length > 0) {
                const result = response.data[0];
                return {
                    lat: parseFloat(result.lat),
                    lng: parseFloat(result.lon),
                    displayName: result.display_name,
                    accuracy: this.determineAccuracy(result),
                    source: 'nominatim',
                    placeType: result.type,
                    importance: result.importance
                };
            }

            return null;
        } catch (error) {
            console.error('Nominatim geocoding error:', error.message);
            return null;
        }
    }

    async geocodeWithGoogle(address) {
        if (!this.googleMapsApiKey) return null;

        try {
            const url = 'https://maps.googleapis.com/maps/api/geocode/json';
            const response = await axios.get(url, {
                params: { address, key: this.googleMapsApiKey },
                timeout: 10000
            });

            if (response.data.status === 'OK' && response.data.results.length > 0) {
                const result = response.data.results[0];
                return {
                    lat: result.geometry.location.lat,
                    lng: result.geometry.location.lng,
                    displayName: result.formatted_address,
                    accuracy: this.determineGoogleAccuracy(result.geometry.location_type),
                    source: 'google',
                    placeType: result.types[0],
                    placeId: result.place_id
                };
            }

            return null;
        } catch (error) {
            console.error('Google geocoding error:', error.message);
            return null;
        }
    }

    async geocodeWithMapbox(address) {
        if (!this.mapboxApiKey) return null;

        try {
            const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json`;
            const response = await axios.get(url, {
                params: { access_token: this.mapboxApiKey, limit: 1 },
                timeout: 10000
            });

            if (response.data.features && response.data.features.length > 0) {
                const result = response.data.features[0];
                return {
                    lat: result.center[1],
                    lng: result.center[0],
                    displayName: result.place_name,
                    accuracy: this.determineMapboxAccuracy(result.relevance),
                    source: 'mapbox',
                    placeType: result.place_type[0],
                    id: result.id
                };
            }

            return null;
        } catch (error) {
            console.error('Mapbox geocoding error:', error.message);
            return null;
        }
    }

    async tryProviders(query, preferredProvider = null) {
        const providers = [];
        if (preferredProvider) providers.push(preferredProvider);
        if (this.googleMapsApiKey && !providers.includes('google')) providers.push('google');
        if (this.mapboxApiKey && !providers.includes('mapbox')) providers.push('mapbox');
        if (!providers.includes('nominatim')) providers.push('nominatim');

        for (const provider of providers) {
            let result = null;
            if (provider === 'google') result = await this.geocodeWithGoogle(query);
            else if (provider === 'mapbox') result = await this.geocodeWithMapbox(query);
            else if (provider === 'nominatim') result = await this.geocodeWithNominatim(query);

            if (result) return result;
        }
        return null;
    }

    async geocodeAddress(address, preferredProvider = null) {
        if (!address || address.trim() === '') return null;

        const queries = this.buildFallbackQueries(address);

        for (let i = 0; i < queries.length; i++) {
            const query = queries[i];
            const result = await this.tryProviders(query, preferredProvider);
            if (result) {
                if (i > 0) {
                    result.accuracy = 'approximate';
                }
                console.log(`Geocoding successful ("${address}" via "${query}") → (${result.lat}, ${result.lng})`);
                return result;
            }
        }

        console.warn(`Geocoding failed for address: "${address}"`);
        return null;
    }

    async batchGeocode(addresses) {
        const results = [];
        for (const address of addresses) {
            const geocoded = await this.geocodeAddress(address);
            results.push({
                address,
                coordinates: geocoded ? { lat: geocoded.lat, lng: geocoded.lng } : null,
                displayName: geocoded?.displayName || null,
                success: !!geocoded
            });
            await this.delay(200);
        }
        return results;
    }

    async reverseGeocode(lat, lng) {
        try {
            await this.respectRateLimit();

            const url = 'https://nominatim.openstreetmap.org/reverse';
            const response = await axios.get(url, {
                params: { lat, lon: lng, format: 'json', addressdetails: 1 },
                headers: { 'User-Agent': 'MissingPersonsPlatform/1.0' },
                timeout: 10000
            });

            if (response.data) {
                return {
                    address: response.data.display_name,
                    displayName: response.data.display_name,
                    components: response.data.address,
                    lat: parseFloat(response.data.lat),
                    lng: parseFloat(response.data.lon)
                };
            }

            return null;
        } catch (error) {
            console.error('Reverse geocoding error:', error.message);
            return null;
        }
    }

    determineAccuracy(result) {
        if (result.type === 'house' || result.type === 'building') return 'exact';
        if (result.type === 'street' || result.type === 'road') return 'approximate';
        if (result.type === 'city' || result.type === 'town') return 'estimated';
        if (result.importance > 0.7) return 'approximate';
        return 'estimated';
    }

    determineGoogleAccuracy(locationType) {
        switch (locationType) {
            case 'ROOFTOP': return 'exact';
            case 'RANGE_INTERPOLATED': return 'approximate';
            case 'GEOMETRIC_CENTER': return 'estimated';
            case 'APPROXIMATE': return 'estimated';
            default: return 'approximate';
        }
    }

    determineMapboxAccuracy(relevance) {
        if (relevance >= 0.99) return 'exact';
        if (relevance >= 0.9) return 'approximate';
        return 'estimated';
    }

    isValidCoordinates(lat, lng) {
        return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
    }

    getDistance(lat1, lng1, lat2, lng2) {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    async extractAndGeocodeLocations(text) {
        const locationPatterns = [
            /(?:in|at|near|around)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g,
            /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:city|town|village|area)/gi
        ];

        const potentialLocations = new Set();

        for (const pattern of locationPatterns) {
            let match;
            while ((match = pattern.exec(text)) !== null) {
                potentialLocations.add(match[1]);
            }
        }

        const results = [];
        for (const location of potentialLocations) {
            const geocoded = await this.geocodeAddress(location);
            if (geocoded) {
                results.push({
                    location,
                    coordinates: { lat: geocoded.lat, lng: geocoded.lng },
                    displayName: geocoded.displayName,
                    accuracy: geocoded.accuracy
                });
            }
        }

        return results;
    }
}

const geocodingService = new GeocodingService();

module.exports = geocodingService;