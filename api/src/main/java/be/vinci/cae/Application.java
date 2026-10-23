package be.vinci.cae;

import me.paulschwarz.springdotenv.DotenvConfig;
import me.paulschwarz.springdotenv.DotenvPropertySource;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;

/**
 * Application entry point for the CAE backend.
 */
@SuppressWarnings("PMD.UseUtilityClass")
@SpringBootApplication
public class Application {
  /**
   * Starts the Spring Boot application.
   *
   * @param args command-line arguments.
   */
  public static void main(String[] args) {
    try (AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext()) {
      DotenvPropertySource.addToEnvironment(context.getEnvironment(), DotenvConfig.defaults());
      SpringApplication.run(Application.class, args);
    }
  }
}