package com.tripCraft.config;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Map;

@Configuration
public class CloudinaryConfig {

    @Bean
    public Cloudinary cloudinary() {
        return new Cloudinary(ObjectUtils.asMap(
                "cloud_name", "didg0xpge",
                "api_key", "622426854636421",
                "api_secret", "HwlCX4qr5FOBmVTlJfIFB5KHor0",
                "secure", true
        ));
    }
}
