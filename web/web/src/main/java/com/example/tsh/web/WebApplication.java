package com.example.tsh.web;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class WebApplication {

	public static void main(String[] args) {

		SpringApplication.run(WebApplication.class, args);
		System.out.println("Build Success");
	}

}
