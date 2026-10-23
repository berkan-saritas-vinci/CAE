package be.vinci.cae.seeds;

import be.vinci.cae.models.InscriptionTournament;
import be.vinci.cae.models.Match;
import be.vinci.cae.models.Picture;
import be.vinci.cae.models.SelectionMatch;
import be.vinci.cae.models.Team;
import be.vinci.cae.models.Tournament;
import be.vinci.cae.models.User;
import be.vinci.cae.repositories.InscriptionTournamentRepository;
import be.vinci.cae.repositories.MatchRepository;
import be.vinci.cae.repositories.PictureRepository;
import be.vinci.cae.repositories.SelectionMatchRepository;
import be.vinci.cae.repositories.SpecialityRepository;
import be.vinci.cae.repositories.TeamRepository;
import be.vinci.cae.repositories.TournamentRepository;
import be.vinci.cae.repositories.UserRepository;
import java.sql.Date;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Data initializer for demo profile.
 */
@SuppressWarnings("PMD.UseUtilityClass")
@Component
@Profile("demo")
public class DemoDataInitializer implements CommandLineRunner {

  private static final String DEFAULT_PASSWORD = "Password123!";

  private final UserRepository userRepository;
  private final TeamRepository teamRepository;
  private final PictureRepository pictureRepository;
  private final SpecialityRepository specialityRepository;
  private final BCryptPasswordEncoder passwordEncoder;
  private final TournamentRepository tournamentRepository;
  private final MatchRepository matchRepository;
  private final InscriptionTournamentRepository inscriptionTournamentRepository;
  private final SelectionMatchRepository selectionMatchRepository;

  /**
   * Creates the demo initializer with its dependencies.
   *
   * @param userRepository user repository
   * @param teamRepository team repository
   * @param pictureRepository picture repository
   * @param specialityRepository speciality repository
   * @param passwordEncoder password encoder
   * @param tournamentRepository tournament repository
   * @param matchRepository match repository
   * @param inscriptionTournamentRepository inscription tournament repository
   * @param selectionMatchRepository selection-match repository
   */
  public DemoDataInitializer(
      UserRepository userRepository,
      TeamRepository teamRepository,
      PictureRepository pictureRepository,
      SpecialityRepository specialityRepository,
      BCryptPasswordEncoder passwordEncoder,
      TournamentRepository tournamentRepository,
      MatchRepository matchRepository,
      InscriptionTournamentRepository inscriptionTournamentRepository,
      SelectionMatchRepository selectionMatchRepository
  ) {
    this.userRepository = userRepository;
    this.teamRepository = teamRepository;
    this.pictureRepository = pictureRepository;
    this.specialityRepository = specialityRepository;
    this.passwordEncoder = passwordEncoder;
    this.tournamentRepository = tournamentRepository;
    this.matchRepository = matchRepository;
    this.inscriptionTournamentRepository = inscriptionTournamentRepository;
    this.selectionMatchRepository = selectionMatchRepository;
  }

  @Override
  public void run(String... args) {
    if (userRepository.count() > 0) {
      return;
    }

    initializePicturesAndSpecialities();
    initializeDemoUsersAndTeams();
    initializeDemoTournamentsAndMatches();
  }

  private void initializePicturesAndSpecialities() {
    SeedDataSupport.initializePicturesAndSpecialities(
        pictureRepository,
        specialityRepository,
        SeedDataSupport.DEMO_AVATAR_LINKS,
        SeedDataSupport.SPECIALITY_NAMES
    );
  }

  private void initializeDemoUsersAndTeams() {
    Team teamAlpha = getOrCreateTeam("TEAM_ALPHA");
    Team teamOmega = getOrCreateTeam("TEAM_OMEGA");
    Team teamIota = getOrCreateTeam("TEAM_IOTA");
    Team teamDelta = getOrCreateTeam("TEAM_DELTA");

    List<UserSeed> seeds = List.of(
        new UserSeed(
            "lea@mail.com", "Lynx", "Tacticien", "2025-11-12", "ADMIN", teamAlpha,
            getPictureForIndex(0)
        ),
        new UserSeed(
            "tom@mail.com", "Rogue", "Exécuteur", "2025-12-03", "USER", teamAlpha,
            getPictureForIndex(1)
        ),
        new UserSeed(
            "ines@mail.com", "Pulse", "Guérisseur", "2026-01-18", "USER", teamAlpha,
            getPictureForIndex(2)
        ),
        new UserSeed(
            "pol@mail.com", "Wolf", "Architecte", "2026-02-02", "USER", teamAlpha,
            getPictureForIndex(3)
        ),
        new UserSeed(
            "tibo@mail.com", "Iron", "Gardien", "2025-10-27", "ADMIN", teamOmega,
            getPictureByPath("/src/assets/avatars/avatar8.jpg")
        ),
        new UserSeed(
            "neo@mail.com", "Shade", "Catalyseur", "2025-10-30", "USER", teamOmega,
            getPictureForIndex(5)
        ),
        new UserSeed(
            "lisa@mail.com", "Storm", "Exécuteur", "2026-01-10", "USER", teamIota,
            getPictureForIndex(6)
        ),
        new UserSeed(
            "noa@mail.com", "Flash", "Architecte", "2026-02-02", "USER", teamIota,
            getPictureForIndex(7)
        ),
        new UserSeed(
            "tim@mail.com", "Titi", "Gardien", "2026-02-03", "USER", teamIota,
            getPictureForIndex(8)
        ),
        new UserSeed(
            "zoe@mail.com", "Vector", "Catalyseur", "2026-02-04", "USER", teamIota,
            getPictureForIndex(9)
        ),
        new UserSeed(
            "max@mail.com", "Iron", "Gardien", "2026-03-12", "USER", teamDelta,
            getPictureForIndex(10)
        ),
        new UserSeed(
            "ali@mail.com", "Putsh", "Perturbateur", "2026-01-22", "USER", teamDelta,
            getPictureForIndex(11)
        ),
        new UserSeed(
            "zed@mail.com", "Zero", "Architecte", "2025-12-11", "ADMIN", teamDelta,
            getPictureForIndex(12)
        ),
        new UserSeed(
            "seb@mail.com", "Ice", "Guérisseur", "2026-03-01", "ADMIN", teamDelta,
            getPictureForIndex(13)
        ),
        new UserSeed(
            "oli@mail.com", "Tiger", "Tacticien", "2025-11-11", "USER", teamDelta,
            getPictureForIndex(14)
        ),
        new UserSeed(
            "fin@mail.com", "Final", "Exécuteur", "2025-10-22", "USER", teamDelta,
            getPictureForIndex(15)
        )
    );

        for (UserSeed seed : seeds) {
      User user = userRepository.findByMail(seed.mail());
      if (user == null) {
        user = new User();
      }

      user.setMail(seed.mail());
      user.setTag(seed.tag());
      user.setSpeciality(specialityRepository.findBySpeciality(seed.speciality()));
      user.setRole(seed.role());
      user.setCreationDate(Date.valueOf(seed.creationDate()));
      user.setPicture(seed.image());
      user.setPassword(passwordEncoder.encode(DEFAULT_PASSWORD));
      user.setTeam(seed.team());
      userRepository.save(user);
    }

    User lea = userRepository.findByMail("lea@mail.com");
    User tibo = userRepository.findByMail("tibo@mail.com");

    teamAlpha.setResponsable(lea.getId());
    teamAlpha.setSecondResponsable(0);

    teamOmega.setResponsable(tibo.getId());
    teamOmega.setSecondResponsable(0);

    teamIota.setResponsable(userRepository.findByMail("lisa@mail.com").getId());
    teamIota.setSecondResponsable(userRepository.findByMail("noa@mail.com").getId());

    teamDelta.setResponsable(userRepository.findByMail("max@mail.com").getId());
    teamDelta.setSecondResponsable(userRepository.findByMail("seb@mail.com").getId());

    teamRepository.save(teamAlpha);
    teamRepository.save(teamOmega);
    teamRepository.save(teamIota);
    teamRepository.save(teamDelta);
  }

  private void initializeDemoTournamentsAndMatches() {
    Team teamAlpha = teamRepository.getByName("TEAM_ALPHA");
    Team teamOmega = teamRepository.getByName("TEAM_OMEGA");
    Team teamIota = teamRepository.getByName("TEAM_IOTA");
    Team teamDelta = teamRepository.getByName("TEAM_DELTA");

    Tournament springOpen = createTournament(
        "Spring Open 2026",
        "Tournoi de démonstration - printemps",
        "2026-03-01",
        "2026-03-07",
        "2026-02-27",
        "TERMINE",
        4L,
        4L
    );
    Tournament summerClash = createTournament(
        "Summer Clash 2026",
        "Tournoi de démonstration - été",
        "2026-04-10",
        "2026-04-17",
        "2026-04-05",
        "TERMINE",
        4L,
        4L
    );
    Tournament autumnCup = createTournament(
        "Autumn Cup 2026",
        "Tournoi de démonstration - automne",
        "2026-05-20",
        "2026-05-26",
        "2026-05-15",
        "EN_COURS",
        4L,
        4L
    );

    registerTeamsToTournament(springOpen, List.of(teamAlpha, teamOmega, teamIota, teamDelta));
    registerTeamsToTournament(summerClash, List.of(teamAlpha, teamOmega, teamIota, teamDelta));
    registerTeamsToTournament(autumnCup, List.of(teamAlpha, teamOmega, teamIota, teamDelta));

    User admin = userRepository.findByMail("lea@mail.com");
    User tibo = userRepository.findByMail("tibo@mail.com");

    Match m1 = createMatch(
        springOpen,
        teamOmega,
        teamAlpha,
        "2026-03-02",
        "FINISHED",
        2,
        1,
        1L,
        admin
    );
    Match m2 = createMatch(
        summerClash,
        teamIota,
        teamOmega,
        "2026-04-11",
        "FINISHED",
        0,
        2,
        1L,
        admin
    );
    Match m3 = createMatch(
        autumnCup,
        teamOmega,
        teamDelta,
        "2026-05-21",
        "TERMINED",
        1,
        1,
        1L,
        admin
    );

    createSelection(tibo, teamOmega, m1);
    createSelection(tibo, teamOmega, m2);
    createSelection(tibo, teamOmega, m3);
    createSelection(
        tibo,
        teamOmega,
        createMatch(
            autumnCup,
            teamOmega,
            teamIota,
            "2026-05-23",
            "PLANNED",
            null,
            null,
            2L,
            admin
        )
    );

    Tournament springArenaCup2025 = createTournamentWithWinner(
        "Spring Arena Cup 2025",
        "Compétition printanière ouverte aux nouvelles teams émergentes",
        "2025-04-15",
        "2025-04-25",
        "2025-04-10",
        "TERMINE",
        8L,
        7L,
        teamOmega
    );
    Tournament eliteChampionship2025 = createTournamentWithWinner(
        "Elite Championship 2025",
        "Compétition élite réservée aux meilleures teams",
        "2025-05-15",
        "2025-05-30",
        "2025-05-11",
        "TERMINE",
        8L,
        6L,
        teamIota
    );
    Tournament summerProLeague2025 = createTournamentWithWinner(
        "Summer Pro League 2025",
        "Tournoi estival de haut niveau avec les meilleures teams",
        "2025-07-01",
        "2025-07-15",
        "2025-06-25",
        "TERMINE",
        16L,
        14L,
        teamAlpha
    );

    registerTeamsToTournament(
        springArenaCup2025,
        List.of(teamAlpha, teamOmega, teamIota, teamDelta)
    );
    registerTeamsToTournament(
        eliteChampionship2025,
        List.of(teamAlpha, teamOmega, teamIota, teamDelta)
    );
    registerTeamsToTournament(
        summerProLeague2025,
        List.of(teamAlpha, teamOmega, teamIota, teamDelta)
    );
    registerTeamsToTournament(
        createTournamentWithWinner(
            "Vinci Winter Clash 2026",
            "Tournoi hivernal réunissant des équipes semi-professionnelles",
            "2026-01-10",
            "2026-01-20",
            "2026-01-05",
            "TERMINE",
            12L,
            12L,
            teamDelta
        ),
        List.of(teamAlpha, teamOmega, teamIota, teamDelta)
    );
    registerTeamsToTournament(
        createTournamentWithWinner(
            "Vinci Easter Cup 2026",
            "Tournoi de Pâques ouvert à toutes les teams actives",
            "2026-04-15",
            "2026-04-25",
            "2026-04-08",
            "TERMINE",
            8L,
            7L,
            teamDelta
        ),
        List.of(teamAlpha, teamOmega, teamIota, teamDelta)
    );

    Team teamSigma = getOrCreateTeam("TEAM_SIGMA");
    Team teamNova = getOrCreateTeam("TEAM_NOVA");
    Team teamRaven = getOrCreateTeam("TEAM_RAVEN");
    Team teamBlaze = getOrCreateTeam("TEAM_BLAZE");

    Tournament springBattleSeries2026 = createTournament(
        "Spring Battle Series 2026",
        "Série printanière avec élimination directe et forte participation",
        "2026-05-04",
        "2026-05-13",
        "2026-05-01",
        "EN_COURS",
        8L,
        8L
    );

    registerTeamsToTournament(
        springBattleSeries2026,
        List.of(
            teamAlpha,
            teamDelta,
            teamIota,
            teamOmega,
            teamSigma,
            teamNova,
            teamRaven,
            teamBlaze
        )
    );

    Match deltaVsIota = createMatch(
        springBattleSeries2026,
        teamDelta,
        teamIota,
        "2026-05-10 11:00:00",
        "PLANNED",
        null,
        null,
        1L,
        admin
    );

    createSelection(userRepository.findByMail("max@mail.com"), teamDelta, deltaVsIota);
    createSelection(userRepository.findByMail("lisa@mail.com"), teamIota, deltaVsIota);

    Match omegaVsAlpha = createMatch(
        springBattleSeries2026,
        teamOmega,
        teamAlpha,
        "2026-05-12 11:00:00",
        "PLANNED",
        null,
        null,
        1L,
        admin
    );

    createSelection(userRepository.findByMail("tibo@mail.com"), teamOmega, omegaVsAlpha);
    createSelection(userRepository.findByMail("lea@mail.com"), teamAlpha, omegaVsAlpha);

    createMatch(
        springBattleSeries2026,
        null,
        null,
        "2026-05-13 11:00:00",
        "PLANNED",
        null,
        null,
        2L,
        admin
    );

    Team teamOrion = getOrCreateTeam("TEAM_ORION");
    Team teamPhoenix = getOrCreateTeam("TEAM_PHOENIX");

    Tournament eliteChampionship2026 = createTournament(
        "Elite Championship 2026",
        "Compétition élite réservée aux meilleures teams",
        "2026-05-16",
        "2026-05-30",
        "2026-05-13",
        "A_VENIR",
        10L,
        9L
    );

    registerTeamsToTournament(
        eliteChampionship2026,
        List.of(
            teamAlpha,
            teamIota,
            teamOmega,
            teamSigma,
            teamNova,
            teamRaven,
            teamBlaze,
            teamOrion,
            teamPhoenix
        )
    );
  }

  private Team getOrCreateTeam(String name) {
    return teamRepository.findByName(name).orElseGet(() -> {
      Team team = new Team();
      team.setName(name);
      return teamRepository.save(team);
    });
  }

  private Tournament createTournament(
      String name,
      String description,
      String startDate,
      String endDate,
      String registrationEndDate,
      String state,
      long maxTeams,
      long registeredTeams
  ) {
    Tournament tournament = buildTournament(
        name,
        description,
        startDate,
        endDate,
        registrationEndDate,
        state,
        maxTeams,
        registeredTeams
    );
    return tournamentRepository.save(tournament);
  }

  private Tournament createTournamentWithWinner(
      String name,
      String description,
      String startDate,
      String endDate,
      String registrationEndDate,
      String state,
      long maxTeams,
      long registeredTeams,
      Team winner
  ) {
    Tournament tournament = buildTournament(
        name,
        description,
        startDate,
        endDate,
        registrationEndDate,
        state,
        maxTeams,
        registeredTeams
    );
    tournament.setGagnant(winner);
    return tournamentRepository.save(tournament);
  }

  private Tournament buildTournament(
      String name,
      String description,
      String startDate,
      String endDate,
      String registrationEndDate,
      String state,
      long maxTeams,
      long registeredTeams
  ) {
    Tournament tournament = new Tournament();
    tournament.setNom(name);
    tournament.setDescription(description);
    tournament.setDateDebut(Date.valueOf(startDate));
    tournament.setDateFin(Date.valueOf(endDate));
    tournament.setDateFinInscription(Date.valueOf(registrationEndDate));
    tournament.setEtat(state);
    tournament.setNbrTeam(maxTeams);
    tournament.setNbrTeamInscrite(registeredTeams);
    return tournament;
  }

  private void registerTeamsToTournament(Tournament tournament, List<Team> teams) {
    List<InscriptionTournament> inscriptions = new ArrayList<>();

    for (Team team : teams) {
      InscriptionTournament inscription = new InscriptionTournament();
      inscription.setTeam(team);
      inscription.setTournament(tournament);
      inscriptions.add(inscription);
    }

    inscriptionTournamentRepository.saveAll(inscriptions);
  }

  private Match createMatch(
      Tournament tournament,
      Team team1,
      Team team2,
      String dateTime,
      String status,
      Integer resultTeam1,
      Integer resultTeam2,
      Long turn,
      User administrator
  ) {
    Match match = new Match();
    match.setTournament(tournament);
    match.setTeam1(team1);
    match.setTeam2(team2);
    match.setDateTime(parseDateTime(dateTime));
    match.setStatus(status);
    match.setResultTeam1(resultTeam1);
    match.setResultTeam2(resultTeam2);
    match.setTurn(turn);
    match.setAdministrator(administrator);
    match.setTeam1Validated(true);
    match.setTeam2Validated(true);
    match.setTeam1contested(false);
    match.setTeam2contested(false);
    return matchRepository.save(match);
  }

  private java.util.Date parseDateTime(String value) {
    if (value != null && value.length() > 10) {
      return Timestamp.valueOf(value);
    }
    return Date.valueOf(value);
  }

  private void createSelection(User user, Team team, Match match) {
    SelectionMatch selectionMatch = new SelectionMatch();
    selectionMatch.setUser(user);
    selectionMatch.setTeam(team);
    selectionMatch.setMatch(match);
    selectionMatchRepository.save(selectionMatch);
  }

    private Picture getPictureForIndex(int index) {
        return pictureRepository.findByLink(
                SeedDataSupport.DEMO_AVATAR_LINKS.get(
                        index % SeedDataSupport.DEMO_AVATAR_LINKS.size()
                )
        );
    }

    private Picture getPictureByPath(String path) {
        return pictureRepository.findByLink(path);
    }

  private record UserSeed(
      String mail,
      String tag,
      String speciality,
      String creationDate,
      String role,
      Team team,
      Picture image
  ) {
  }
}
