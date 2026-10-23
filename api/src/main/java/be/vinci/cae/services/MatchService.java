package be.vinci.cae.services;

import be.vinci.cae.dto.MatchResultDto;
import be.vinci.cae.models.Match;
import be.vinci.cae.models.SelectionMatch;
import be.vinci.cae.models.Team;
import be.vinci.cae.models.Tournament;
import be.vinci.cae.models.User;
import be.vinci.cae.repositories.MatchRepository;
import be.vinci.cae.repositories.SelectionMatchRepository;
import be.vinci.cae.repositories.TournamentRepository;
import be.vinci.cae.repositories.UserRepository;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ThreadLocalRandom;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/**
 * Business service for match operations.
 */
@Service
public class MatchService {
  private final MatchRepository matchRepository;
  private final TournamentService tournamentService;
  private final InscriptionTournamentService inscriptionTournamentService;
  private final SelectionMatchRepository selectionMatchRepository;
  private final UserRepository userRepository;
  private final TournamentRepository tournamentRepository;

  /**
   * Creates a service with its repository dependency.
   *
   * @param matchRepository repository used to persist and query matches
   */
  public MatchService(MatchRepository matchRepository,
                      TournamentService tournamentService,
                      InscriptionTournamentService inscriptionTournamentService,
                      SelectionMatchRepository selectionMatchRepository,
                      UserRepository userRepository, TournamentRepository tournamentRepository) {
    this.matchRepository = matchRepository;
    this.tournamentService = tournamentService;
    this.inscriptionTournamentService = inscriptionTournamentService;
    this.selectionMatchRepository = selectionMatchRepository;
    this.userRepository = userRepository;
    this.tournamentRepository = tournamentRepository;
  }

  /**
   * Gets matches for a given tournament.
   *
   * @param tournament tournament reference
   * @return matches linked to the tournament, or an empty list when tournament is null
   */
  public List<Match> getByTournament(Tournament tournament) {
    if (tournament == null) {
      return Collections.emptyList();
    }
    List<Match> matches = new ArrayList<>(matchRepository.getByTournament(tournament));
    matches.sort(
        Comparator.comparingLong(Match::getTurn)
            .thenComparingLong(Match::getId)
    );
    return matches;
  }

  /**
   * Gets matches for a given tournament.
   *
   * @param team team reference
   * @return matches linked to the tournament, or an empty list when tournament is null
   */
  public List<Match> getByTeam(Team team) {
    if (team == null) {
      return Collections.emptyList();
    }
    return matchRepository.getByTeam1OrTeam2(team, team);
  }

  /**
   * Persists a new match.
   *
   * @param match match to save
   * @return saved match
   */
  public Match createMatch(Match match) {
    return matchRepository.save(match);
  }

  /**
   * Get a match by his id.
   *
   * @param id of the match
   * @return the match with the id
   */
  public Optional<Match> getMatchById(long id) {
    return matchRepository.findById(id);
  }

  /**
   * Generates matches for a tournament if no matches already exist.
   *
   * @param tournamentId tournament identifier
   * @return generated matches, an empty list when tournament is invalid, or null when generation is
   *     not possible
   */
  public List<Match> generationMatch(Long tournamentId) {
    Optional<Tournament> optionalTournament = tournamentService.getTournamentById(tournamentId);
    if (optionalTournament.isEmpty()) {
      return Collections.emptyList();
    }
    Tournament tournament = optionalTournament.get();

    if (!getByTournament(tournament).isEmpty()) {
      return Collections.emptyList();
    }

    tournament.setEtat("A_VENIR");
    tournamentRepository.save(tournament);

    List<Match> matchs = new ArrayList<>();
    List<Date> dates = new ArrayList<>();
    dates.add(tournament.getDateDebut());
    int nbrTeam = tournament.getNbrTeamInscrite().intValue();

    if (nbrTeam < 2) {
      return matchs;
    }

    int nbrRound = round(nbrTeam);
    Long cpt2 = 1L;

    while (nbrTeam > 1) {
      int teamsThisRound = nbrTeam;
      int matchesThisRound = teamsThisRound / 2;
      for (int j = 0; j < matchesThisRound; j++) {
        Match match = new Match();
        match.setTournament(tournament);
        match.setTurn(cpt2);
        match.setStatus("PLANNED");
        if (match.getTurn() == 1) {
          match.setDateTime(tournament.getDateDebut());
        } else if (match.getTurn() == nbrRound) {
          match.setDateTime(tournament.getDateFin());
        } else {
          Date date = generateDateBetween2Date(dates.getFirst(), tournament.getDateFin());
          dates.addFirst(date);
          match.setDateTime(date);
        }
        matchs.add(match);
        matchRepository.save(match);
      }
      nbrTeam = (teamsThisRound / 2) + (teamsThisRound % 2);
      cpt2++;
    }
    if (matchs.size() != (tournament.getNbrTeamInscrite() - 1)) {
      return Collections.emptyList();
    }
    return matchs;
  }

  /**
   * Calculates the number of rounds needed for a tournament.
   *
   * @param teamCount number of teams
   * @return number of rounds required
   */
  public static int round(int teamCount) {
    if (teamCount <= 1) {
      return 1;
    }
    return (int) Math.ceil(Math.log(teamCount) / Math.log(2));
  }

  /**
   * Generates a random date between two given dates at 16:00:00.
   *
   * @param date1 first date boundary
   * @param date2 second date boundary
   * @return random date between date1 and date2 at 16:00:00
   */
  public static Date generateDateBetween2Date(Date date1, Date date2) {
    long min = Math.min(date1.getTime(), date2.getTime());
    long max = Math.max(date1.getTime(), date2.getTime());

    long randomMillis = ThreadLocalRandom.current().nextLong(min, max);
    
    // mettre l'heure à 16:00:00
    // on a vu ça en java avancé (cf.vidéo)
    Calendar cal = Calendar.getInstance();
    cal.setTimeInMillis(randomMillis);
    cal.set(Calendar.HOUR_OF_DAY, 16);
    cal.set(Calendar.MINUTE, 0);
    cal.set(Calendar.SECOND, 0);
    cal.set(Calendar.MILLISECOND, 0);
    
    return cal.getTime();
  }

  /**
   * Initializes team assignments for the first round of a tournament.
   *
   * @param id tournament identifier
   * @return updated match list or null when initialization cannot proceed
   */
  public List<Match> initMatchTeam(Long id) {
    Tournament tournament = null;
    List<Team> teams = null;
    List<Match> matches = null;
    try {
      tournament = getTournamentById(id);

      teams = new ArrayList<>(
        inscriptionTournamentService.getTeamsByTournamentId(tournament.getId()));
      matches = getByTournament(tournament);
    } catch (Exception e) {
      throw new RuntimeException(e);
    }

    tournament.setEtat("EN_COURS");
    tournamentRepository.save(tournament);

    if (matches.isEmpty() || matches.getLast().getResultTeam1() != null) {
      return Collections.emptyList();
    }

    Long turn = 1L;
    for (Match m : matches) {
      if (m.getTeam1() == null && m.getTeam2() == null) {
        turn = matches.getFirst().getTurn() + 1;
        break;
      }
    }
    turn--;

    setTeamIntoMatch(teams, matches, turn);
    return getByTournament(tournament);
  }

  /**
   * Updates team assignments for the next round of a tournament.
   *
   * @param id tournament identifier
   * @return updated match list or null when update cannot proceed
   */
  public List<Match> updateMatchTeam(Long id) {
    Tournament tournament = getTournamentById(id);

    List<Team> teams = new ArrayList<>(
        inscriptionTournamentService.getTeamsByTournamentId(tournament.getId()));
    List<Match> matches = getByTournament(tournament);

    if (matches.isEmpty()) {
      return Collections.emptyList();
    }

    while (!matches.isEmpty()) {
      Match match = matches.getFirst();
      if (match.getResultTeam1() == null || match.getResultTeam2() == null) {
        break;
      }

      if (match.getResultTeam1() > match.getResultTeam2()) {
        teams.remove(match.getTeam2());
      } else {
        teams.remove(match.getTeam1());
      }

      matches.removeFirst();
    }

    if (matches.isEmpty()) {
      return Collections.emptyList();
    }

    Long turn = matches.getFirst().getTurn();
    setTeamIntoMatch(teams, matches, turn);
    return getByTournament(tournament);
  }

  private void setTeamIntoMatch(List<Team> teams, List<Match> matches, Long turn) {
    for (Team t : teams) {
      if (matches.isEmpty()) {
        break;
      }
      Match match = matches.getFirst();
      if (!match.getTurn().equals(turn)) {
        break;
      }
      if (match.getTeam1() != null) {
        match.setTeam2(t);
        matchRepository.save(match);
        matches.removeFirst();
      } else {
        match.setTeam1(t);
        matchRepository.save(match);
      }
    }
  }

  /**
   * Records the score for a match if it has not already been set.
   *
   * @param id match identifier
   * @param dto the match result data
   * @return updated match or null when result cannot be recorded
   */
  public Match setResultat(Long id, MatchResultDto dto) {
    Match match = matchRepository.findById(id).orElse(null);
    if (match == null) {
      return null;
    }

    // Check if the match date has passed
    if (match.getDateTime() != null && match.getDateTime().after(new Date())) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST, 
          "Les résultats ne peuvent pas être encodés avant la date du match"
      );
    }

    // If already encoded and not CONTESTED, just return it
    if ((match.getResultTeam1() != null || match.getResultTeam2() != null) 
        && !match.getStatus().contains("CONTESTED")) {
      return match;
    }

    // Check if teams have at least 1 player selected
    int team1SelectionCount = countTeamSelections(match, match.getTeam1());
    int team2SelectionCount = countTeamSelections(match, match.getTeam2());

    // If a team has less than 1 player, declare forfeit
    if (team1SelectionCount < 1 && team2SelectionCount < 1) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST,
          "Aucune équipe n'a au moins 1 joueur sélectionné - impossible d'encoder le résultat"
      );
    }

    if (team1SelectionCount < 1) {
      return declareForfeit(match, match.getTeam1());
    }

    if (team2SelectionCount < 1) {
      return declareForfeit(match, match.getTeam2());
    }

    match.setResultTeam1(dto.getResultTeam1());
    match.setResultTeam2(dto.getResultTeam2());
    
    if (match.getStatus().contains("CONTESTED")) {
      match.setStatus("FINISHED");
    } else {
      match.setStatus("TERMINED");
    }
    
    Match savedMatch = matchRepository.save(match);
    checkAndAdvanceRound(match);
    return savedMatch;
  }

  private int countTeamSelections(Match match, Team team) {
    if (team == null) {
      return 0;
    }
    List<SelectionMatch> selections = selectionMatchRepository.getByMatch(match);
    return (int) selections.stream()
        .filter(s -> s.getTeam() != null && s.getTeam().equals(team))
        .count();
  }

  private Tournament getTournamentById(Long id) {
    Optional<Tournament> tournament = tournamentService.getTournamentById(id);
    return tournament.get();
  }

  /**
   * Find a match by its ID.
   *
   * @param matchId the ID of the match to find
   * @return the match if found, null otherwise
   */
  public Match findById(Long matchId) {
    return matchRepository.findById(matchId).orElse(null);
  }

  /**
   * Mark a match result as contested by a team.
   *
   * @param match the match to contest
   * @param team the team contesting the result
   * @return updated match
   */
  public Match contested(Match match, Team team) {
    if (match.getTeam1() != null && match.getTeam1().equals(team)) {
      match.setTeam1contested(true);
    } else if (match.getTeam2() != null && match.getTeam2().equals(team)) {
      match.setTeam2contested(true);
    }
    match.setStatus("CONTESTED");
    return matchRepository.save(match);
  }

  /**
   * Mark a match result as validated by a team.
   *
   * @param match the match to validate
   * @param team the team validating the result
   * @return updated match
   */
  public Match valided(Match match, Team team) {
    if (match.getTeam1() != null && match.getTeam1().equals(team)) {
      if (match.isTeam2Validated()) {
        match.setTeam1Validated(true);
        match.setStatus("FINISHED");
        return matchRepository.save(match);
      }
      match.setTeam1Validated(true);
      match.setStatus("VALIDATE_BY_TEAM1");
    } else if (match.getTeam2() != null && match.getTeam2().equals(team)) {
      if (match.isTeam1Validated()) {
        match.setTeam2Validated(true);
        match.setStatus("FINISHED");
        return matchRepository.save(match);
      }
      match.setTeam2Validated(true);
      match.setStatus("VALIDATE_BY_TEAM2");
    }
    return matchRepository.save(match);
  }

  /**
   * Assign an administrator to a match.
   *
   * @param matchId the match identifier
   * @param adminId the administrator identifier
   * @return Optional containing updated match
   */
  public Optional<Match> assignAdministrator(Long matchId, Long adminId) {
    Optional<Match> matchOpt = matchRepository.findById(matchId);
    if (matchOpt.isEmpty()) {
      return Optional.empty();
    }

    Optional<User> adminOpt = userRepository.findById(adminId);
    if (adminOpt.isEmpty()) {
      return Optional.empty();
    }

    Match match = matchOpt.get();
    match.setAdministrator(adminOpt.get());
    return Optional.of(matchRepository.save(match));
  }

  /**
   * Declare forfeit for a match by a team.
   *
   * @param match the match
   * @param team the team declaring forfeit
   * @return updated match
   */
  public Match declareForfeit(Match match, Team team) {
    if (match.getTeam1() != null && match.getTeam1().equals(team)) {
      // Team1 forfeits: Team1 = -1, Team2 = 0 (Team2 wins by forfeit)
      match.setResultTeam1(-1);
      match.setResultTeam2(0);
    } else if (match.getTeam2() != null && match.getTeam2().equals(team)) {
      // Team2 forfeits: Team1 = 0 (Team1 wins by forfeit), Team2 = -1
      match.setResultTeam1(0);
      match.setResultTeam2(-1);
    } else {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Team is not in this match");
    }

    match.setStatus("TERMINED");
    Match savedMatch = matchRepository.save(match);
    checkAndAdvanceRound(match);
    return savedMatch;
  }

  private void checkAndAdvanceRound(Match match) {
    if (match == null || match.getTurn() == null || match.getTournament() == null
        || match.getTournament().getNbrTeam() == null) {
      return;
    }

    Long currentTurn = match.getTurn();
    Tournament tournament = match.getTournament();
    int teamCount = tournament.getNbrTeamInscrite().intValue();

    // Check if all matches of this turn are completed and automatically update teams for next round
    if (currentTurn == round(teamCount)) {
      if (match.getResultTeam1() > match.getResultTeam2()) {
        tournament.setGagnant(match.getTeam1());
      } else if (match.getResultTeam2() > match.getResultTeam1()) {
        tournament.setGagnant(match.getTeam2());
      }
      tournament.setEtat("TERMINE");
      tournamentRepository.save(tournament);
      return;
    }

    List<Match> matchesOfTurn = matchRepository.getByTournamentAndTurn(
        tournament, currentTurn);

    boolean allMatchesCompleted = matchesOfTurn.stream()
        .allMatch(m -> m.getResultTeam1() != null && m.getResultTeam2() != null);

    if (allMatchesCompleted) {
      updateMatchTeam(match.getTournament().getId());
    }
  }
}
