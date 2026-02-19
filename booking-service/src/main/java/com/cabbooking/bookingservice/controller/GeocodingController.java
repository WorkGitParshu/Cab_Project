package com.cabbooking.bookingservice.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api/geocode")
@CrossOrigin(origins = "http://localhost:5173")
public class GeocodingController {

    @Autowired
    private RestTemplate restTemplate;

    @GetMapping
    public ResponseEntity<Object> searchLocation(@RequestParam String query) {
        String url = "https://nominatim.openstreetmap.org/search?format=json&q=" + query;
        
        try {
            // Create a trust manager that does not validate certificate chains
            javax.net.ssl.TrustManager[] trustAllCerts = new javax.net.ssl.TrustManager[] {
                new javax.net.ssl.X509TrustManager() {
                    public java.security.cert.X509Certificate[] getAcceptedIssuers() { return null; }
                    public void checkClientTrusted(java.security.cert.X509Certificate[] certs, String authType) { }
                    public void checkServerTrusted(java.security.cert.X509Certificate[] certs, String authType) { }
                }
            };

            // Install the all-trusting trust manager
            javax.net.ssl.SSLContext sc = javax.net.ssl.SSLContext.getInstance("SSL");
            sc.init(null, trustAllCerts, new java.security.SecureRandom());
            javax.net.ssl.HttpsURLConnection.setDefaultSSLSocketFactory(sc.getSocketFactory());

            // Use a fresh RestTemplate or the existing one (config mostly affects HttpsURLConnection default)
            // But better to configure the request factory if we reused the bean. 
            // For simplicity in this controller scope, we just set the default SSL context for this JVM 
            // process's HttpsURLConnection, which RestTemplate uses by default.
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "CabBookingApp/1.0");
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            ResponseEntity<Object> response = new RestTemplate().exchange(url, HttpMethod.GET, entity, Object.class);
            return ResponseEntity.ok(response.getBody());
            
        } catch (Exception e) {
             e.printStackTrace();
             // Return JSON error to avoid SyntaxError in frontend
             return ResponseEntity.status(500).body(Map.of("error", "Error fetching location: " + e.getMessage()));
        }
    }
}
