package com.saiiconicliv.api;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import java.time.Instant;

@Entity
@Table(name = "enquiries")
public class Enquiry {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @NotBlank private String name;
    @NotBlank @Pattern(regexp = "^[+0-9() .-]{7,20}$", message = "Enter a valid phone number") private String phone;
    private int sharing;
    @Column(length = 2000) private String message;
    private Instant createdAt = Instant.now();
    private boolean contacted = false;

    protected Enquiry() {}
    public Long getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public int getSharing() { return sharing; }
    public void setSharing(int sharing) { this.sharing = sharing; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public Instant getCreatedAt() { return createdAt; }
    public boolean isContacted() { return contacted; }
    public void setContacted(boolean contacted) { this.contacted = contacted; }
}