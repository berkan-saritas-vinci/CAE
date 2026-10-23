package be.vinci.cae.seeds;

import be.vinci.cae.models.Team;
import be.vinci.cae.models.User;
import be.vinci.cae.repositories.PictureRepository;
import be.vinci.cae.repositories.SpecialityRepository;
import be.vinci.cae.repositories.TeamRepository;
import be.vinci.cae.repositories.UserRepository;
import java.sql.Date;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Data initializer for dev profile.
 */
@Component
@Profile("dev")
public class DevDataInitializer implements CommandLineRunner {
  
  @Autowired
  private UserRepository userRepository;
  
  @Autowired
  private TeamRepository teamRepository;
  
  @Autowired
  private PictureRepository pictureRepository;
  
  @Autowired
  private SpecialityRepository specialityRepository;
  
  @Autowired
  private BCryptPasswordEncoder passwordEncoder;

  @Override
  public void run(String... args) throws Exception {
    if (userRepository.count() > 0) {
      return;
    }

    initializePicturesAndSpecialities();
    initializeMinimalUsers();
  }

  private void initializePicturesAndSpecialities() {
    SeedDataSupport.initializePicturesAndSpecialities(
        pictureRepository,
        specialityRepository,
        SeedDataSupport.DEV_AVATAR_LINKS,
        SeedDataSupport.DEV_SPECIALITY_NAMES
    );
  }

  private void initializeMinimalUsers() {
    // Créer 12 utilisateurs pour le développement
    List<String> specialities = SeedDataSupport.DEV_SPECIALITY_NAMES;
    
    for (int i = 1; i <= 12; i++) {
      List<String> adminEmails = List.of("admin@mail.com",
          "dev1@mail.com", "dev2@mail.com", "dev3@mail.com");
      String email = i <= 4 ? adminEmails.get(i - 1)
          : "devuser" + (i - 4) + "@mail.com";
      if (userRepository.findByMail(email) != null) {
        continue;
      }

      User user = new User();
      user.setMail(email);
      List<String> tags = List.of("Admin", "Developer1",
          "Developer2", "Tester");
      user.setTag(i <= 4 ? tags.get(i - 1) : "DevUser" + (i - 4));
      user.setSpeciality(specialityRepository.findBySpeciality(
          specialities.get((i - 1) % specialities.size())));
      user.setRole(i == 1 ? "ADMIN" : "USER");
      String dateStr = "2026-02-" + String.format("%02d",
          (i % 28) + 1);
      user.setCreationDate(Date.valueOf(dateStr));
      String avatarPath = SeedDataSupport.DEV_AVATAR_LINKS.get((i - 1) % 5);
      user.setPicture(pictureRepository.findByLink(avatarPath));
      user.setPassword(passwordEncoder.encode("Password123!"));
      userRepository.save(user);
    }

    // Créer 3 équipes de développement
    Team devTeam1 = teamRepository.findByName("DEV_TEAM_ALPHA").orElseGet(() -> {
      Team t = new Team();
      t.setName("DEV_TEAM_ALPHA");
      return teamRepository.save(t);
    });

    Team devTeam2 = teamRepository.findByName("DEV_TEAM_BETA").orElseGet(() -> {
      Team t = new Team();
      t.setName("DEV_TEAM_BETA");
      return teamRepository.save(t);
    });

    Team devTeam3 = teamRepository.findByName("DEV_TEAM_GAMMA").orElseGet(() -> {
      Team t = new Team();
      t.setName("DEV_TEAM_GAMMA");
      return teamRepository.save(t);
    });

    // Assigner les utilisateurs aux équipes
    User admin = userRepository.findByMail("admin@mail.com");
    User dev1 = userRepository.findByMail("dev1@mail.com");
    User dev2 = userRepository.findByMail("dev2@mail.com");

    if (admin != null) {
      admin.setTeam(devTeam1);
      userRepository.save(admin);
      devTeam1.setResponsable(admin.getId());
    }
    if (dev1 != null) {
      dev1.setTeam(devTeam2);
      userRepository.save(dev1);
      devTeam2.setResponsable(dev1.getId());
    }
    if (dev2 != null) {
      dev2.setTeam(devTeam3);
      userRepository.save(dev2);
      devTeam3.setResponsable(dev2.getId());
    }

    // Assigner les autres utilisateurs
    Iterable<User> otherUsers = userRepository.findAll();
    int teamIndex = 0;
    Team[] teams = {devTeam1, devTeam2, devTeam3};
    for (User user : otherUsers) {
      if (user.getTeam() == null) {
        user.setTeam(teams[teamIndex % 3]);
        userRepository.save(user);
        teamIndex++;
      }
    }

    teamRepository.save(devTeam1);
    teamRepository.save(devTeam2);
    teamRepository.save(devTeam3);
  }
}

