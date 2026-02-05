package com.bintobloom;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableJpaAuditing
@EntityScan("com.bintobloom.entity")
@EnableJpaRepositories("com.bintobloom.repository")
public class BintobloomBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(BintobloomBackendApplication.class, args);
	}

}
