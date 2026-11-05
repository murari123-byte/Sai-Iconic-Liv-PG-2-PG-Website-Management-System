package com.saiiconicliv.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class SaiIconicLivApplication {
    public static void main(String[] args) { SpringApplication.run(SaiIconicLivApplication.class, args); }

    @Bean
    CommandLineRunner seedRooms(RoomRepository rooms) {
        return args -> {
            if (rooms.count() == 0) {
                rooms.save(new Room(2, 12000, "/images/two-sharing.png", "A two-person room with individual beds and a wardrobe.", true));
                rooms.save(new Room(3, 9000, "/images/three-sharing.png", "A shared room arranged for three residents.", true));
                rooms.save(new Room(4, 7800, "/images/four-sharing.png", "A four-person room with individual beds and ceiling fans.", true));
            }
        };
    }
}