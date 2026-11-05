package com.saiiconicliv.api;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "rooms")
public class Room {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Min(1) private int sharing;
    @Min(0) private int rent;
    @NotBlank private String imageUrl;
    @Column(length = 1000) private String description;
    private boolean active = true;

    protected Room() {}
    public Room(int sharing, int rent, String imageUrl, String description, boolean active) {
        this.sharing = sharing; this.rent = rent; this.imageUrl = imageUrl; this.description = description; this.active = active;
    }
    public Long getId() { return id; }
    public int getSharing() { return sharing; }
    public void setSharing(int sharing) { this.sharing = sharing; }
    public int getRent() { return rent; }
    public void setRent(int rent) { this.rent = rent; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}