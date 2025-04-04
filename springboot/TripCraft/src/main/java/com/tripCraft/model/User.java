package com.tripCraft.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Document(collection = "users") // Defines MongoDB collection
public class User {

    @Id
    private String id; // MongoDB uses String/ObjectId as the default ID type
    private String name;
    @Indexed(unique = true)
       private String email; // Explicitly store email (important for OAuth users)
    private String password; // Nullable for OAuth users
    private long phone;
    private String provider; // "LOCAL" for normal users, "GOOGLE" for OAuth users
    private LocalDateTime createdAt; // Timestamp for user creation

    public User() {
        this.createdAt = LocalDateTime.now(); // Automatically set creation time
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

  
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public long getPhone() { return phone; }
    public void setPhone(long phone) { this.phone = phone; }

    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }

    // Format createdAt to a readable string
    public String getCreatedAtAsString() {
        DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
        return createdAt.format(formatter);
    }

    @Override
    public String toString() {
        return "User{" +
                "id='" + id + '\'' +
                ", name='" + name + '\'' +
                ", email='" + email + '\'' +
                ", password='" + password + '\'' +
                ", phone=" + phone +
                ", provider='" + provider + '\'' +
                ", createdAt='" + getCreatedAtAsString() + '\'' +
                '}';
    }
}
