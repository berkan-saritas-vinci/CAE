package be.vinci.cae.seeds;

import be.vinci.cae.models.DemandeAdhesion;
import be.vinci.cae.models.Indisponibility;
import be.vinci.cae.models.InscriptionTournament;
import be.vinci.cae.models.Match;
import be.vinci.cae.models.Team;
import be.vinci.cae.models.Tournament;
import be.vinci.cae.models.User;
import be.vinci.cae.repositories.DemandeAdhesionRepository;
import be.vinci.cae.repositories.IndisponibilityRepository;
import be.vinci.cae.repositories.InscriptionTournamentRepository;
import be.vinci.cae.repositories.MatchRepository;
import be.vinci.cae.repositories.PictureRepository;
import be.vinci.cae.repositories.SpecialityRepository;
import be.vinci.cae.repositories.TeamRepository;
import be.vinci.cae.repositories.TournamentRepository;
import be.vinci.cae.repositories.UserRepository;
import java.sql.Date;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.StreamSupport;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Data initializer for test profile.
 */
@Component
@Profile("test")
public class TestDataInitializer implements CommandLineRunner {

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

  @Autowired
  private TournamentRepository tournamentRepository;

  @Autowired
  private MatchRepository matchRepository;

  @Autowired
  private InscriptionTournamentRepository inscriptionTournamentRepository;

  @Autowired
  private IndisponibilityRepository indisponibilityRepository;

  @Autowired
  private DemandeAdhesionRepository demandeAdhesionRepository;

  @Override
  public void run(String... args) throws Exception {
    if (userRepository.count() > 0) {
      return;
    }

    initializePicturesAndSpecialities();
    initializeTestUsers();
    initializeTournamentsAndMatches();
    initializeIndisponibilities();
    initializeDemandesAdhesion();
  }

  private void initializePicturesAndSpecialities() {
    SeedDataSupport.initializePicturesAndSpecialities(
        pictureRepository,
        specialityRepository,
        SeedDataSupport.TEST_AVATAR_LINKS,
        SeedDataSupport.SPECIALITY_NAMES
    );
  }

  private void initializeTestUsers() {
    final List<String> specialities = SeedDataSupport.SPECIALITY_NAMES;
    final List<String> avatars = SeedDataSupport.TEST_AVATAR_LINKS;

    // Créer 32 utilisateurs pour les tests (4 équipes de 8)
    for (int i = 1; i <= 32; i++) {
      String email = "test_user" + i + "@mail.com";
      if (userRepository.findByMail(email) != null) {
        continue;
      }

      User user = new User();
      user.setMail(email);
      user.setTag("TestUser" + i);
      user.setSpeciality(specialityRepository.findBySpeciality(
          specialities.get((i - 1) % specialities.size())));
      user.setRole(i % 8 == 0 ? "ADMIN" : "USER");
      String dateStr = SeedDataSupport.buildSeedDate(i - 1);
      user.setCreationDate(Date.valueOf(dateStr));
      user.setPicture(pictureRepository.findByLink(
          avatars.get((i - 1) % avatars.size())));
      user.setPassword(passwordEncoder.encode("Password123!"));
      userRepository.save(user);
    }

    // Créer 4 équipes de test
    Team[] testTeams = new Team[4];
    for (int t = 0; t < 4; t++) {
      final int index = t;
      testTeams[t] = teamRepository.findByName("TEST_TEAM_" + (t + 1)).orElseGet(() -> {
        Team team = new Team();
        team.setName("TEST_TEAM_" + (index + 1));
        return teamRepository.save(team);
      });
    }

    // Assigner les utilisateurs aux équipes (8 par équipe)
    for (int i = 1; i <= 32; i++) {
      User user = userRepository.findByMail("test_user" + i + "@mail.com");
      if (user != null) {
        int teamIndex = (i - 1) / 8; // Détermine l'équipe (0-3)
        user.setTeam(testTeams[teamIndex]);
        userRepository.save(user);

        // Assigner le responsable (dernier utilisateur de chaque équipe)
        if (i % 8 == 0) {
          testTeams[teamIndex].setResponsable(user.getId());
          teamRepository.save(testTeams[teamIndex]);
        }
      }
    }
  }

  private void initializeTournamentsAndMatches() {
    // Créer 2 tournois de test
    Tournament t1 = new Tournament();
    t1.setNom("Test Championship 2026");
    t1.setDescription("Tournoi de test pour la validation");
    t1.setDateDebut(Date.valueOf("2026-04-10"));
    t1.setDateFin(Date.valueOf("2026-04-15"));
    t1.setDateFinInscription(Date.valueOf("2026-04-08"));
    t1.setNbrTeam(4L);
    t1.setNbrTeamInscrite(4L);
    t1.setEtat("EN_COURS");
    tournamentRepository.save(t1);

    Tournament t2 = new Tournament();
    t2.setNom("Test Spring Cup 2026");
    t2.setDescription("Tournoi de test printanier");
    t2.setDateDebut(Date.valueOf("2026-05-01"));
    t2.setDateFin(Date.valueOf("2026-05-10"));
    t2.setDateFinInscription(Date.valueOf("2026-04-25"));
    t2.setNbrTeam(4L);
    t2.setNbrTeamInscrite(3L);
    t2.setEtat("INSCRIPTION_OUVERTE");
    tournamentRepository.save(t2);

    Tournament t3 = new Tournament();
    t3.setNom("super tournoi");
    t3.setDescription("c'est comme untournoi");
    t3.setDateDebut(Date.valueOf("2026-04-10"));
    t3.setDateFin(Date.valueOf("2026-05-10"));
    t3.setDateFinInscription(Date.valueOf("2026-02-25"));
    t3.setNbrTeam(25L);
    t3.setNbrTeamInscrite(12L);
    t3.setEtat("INSCRIPTION_OUVERTE");
    tournamentRepository.save(t3);

    // Créer les inscriptions aux tournois
    List<Team> allTeams = teamRepository.findAll();
    for (int i = 0; i < Math.min(4, allTeams.size()); i++) {
      InscriptionTournament it1 = new InscriptionTournament();
      it1.setTeam(allTeams.get(i));
      it1.setTournament(t1);
      inscriptionTournamentRepository.save(it1);

      if (i < 3) {
        InscriptionTournament it2 = new InscriptionTournament();
        it2.setTeam(allTeams.get(i));
        it2.setTournament(t3);
        inscriptionTournamentRepository.save(it2);
      }
    }

    // Créer des matchs pour le premier tournoi
    Match m1 = new Match();
    m1.setTournament(t1);
    m1.setTeam1(allTeams.get(0));
    m1.setTeam2(allTeams.get(1));
    m1.setDateTime(Date.valueOf("2026-04-11"));
    m1.setStatus("FINI");
    m1.setResultTeam1(2);
    m1.setResultTeam2(1);
    matchRepository.save(m1);

    Match m2 = new Match();
    m2.setTournament(t1);
    m2.setTeam1(allTeams.get(2));
    m2.setTeam2(allTeams.get(3));
    m2.setDateTime(Date.valueOf("2026-04-11"));
    m2.setStatus("FINI");
    m2.setResultTeam1(1);
    m2.setResultTeam2(1);
    matchRepository.save(m2);

    Match m3 = new Match();
    m3.setTournament(t1);
    m3.setTeam1(allTeams.get(0));
    m3.setTeam2(allTeams.get(2));
    m3.setDateTime(Date.valueOf("2026-04-13"));
    m3.setStatus("PLANIFIE");
    matchRepository.save(m3);
  }

  private void initializeIndisponibilities() {
    // Ajouter quelques indisponibilités pour des utilisateurs de test
    List<User> users = getTestUsers(0, 5);

    for (int i = 0; i < users.size(); i++) {
      Indisponibility indispo = new Indisponibility();
      indispo.setUser(users.get(i));
      indispo.setStartDate(LocalDate.of(2026, 4, 15));
      indispo.setEndDate(LocalDate.of(2026, 4, 15 + i * 2));
      indisponibilityRepository.save(indispo);
    }
  }

  private void initializeDemandesAdhesion() {
    // Créer quelques demandes d'adhésion
    List<User> users = getTestUsers(5, 3);

    List<Team> teams = teamRepository.findAll();

    for (int i = 0; i < users.size() && i < teams.size(); i++) {
      DemandeAdhesion demande = new DemandeAdhesion();
      demande.setUser(users.get(i));
      demande.setTeam(teams.get((i + 1) % teams.size()));
      demande.setStatut("EN_ATTENTE");
      demandeAdhesionRepository.save(demande);
    }
  }

  private List<User> getTestUsers(long skip, long limit) {
    return StreamSupport.stream(userRepository.findAll().spliterator(), false)
        .filter(u -> u.getMail().startsWith("test_user"))
        .skip(skip)
        .limit(limit)
        .toList();
  }
}