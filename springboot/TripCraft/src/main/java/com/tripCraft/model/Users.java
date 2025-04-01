package com.tripCraft.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Document(collection = "users") // Defines MongoDB collection
public class Users {

    @Id
    private String id; // MongoDB uses String/ObjectId as the default ID type
    private String name;
    private String username;
    private String password;
    private long phone;

    private LocalDateTime createdAt; // Use LocalDateTime for createdAt

    public Users() {
        this.createdAt = LocalDateTime.now(); // Set current time as LocalDateTime
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public long getPhone() { return phone; }
    public void setPhone(long phone) { this.phone = phone; }

    // Method to format the LocalDateTime to ISO format string if required
    public String getCreatedAtAsString() {
        DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME; // ISO format
        return createdAt.format(formatter); // Returns formatted string
    }

    @Override
    public String toString() {
        return "Users{" +
                "id='" + id + '\'' +
                ", name='" + name + '\'' +
                ", username='" + username + '\'' +
                ", password='" + password + '\'' +
                ", phone=" + phone +
                ", createdAt='" + getCreatedAtAsString() + '\'' +
                '}';
    }
}
