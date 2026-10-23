package be.vinci.cae;

import be.vinci.cae.dto.MatchResultDto;
import be.vinci.cae.models.Match;
import be.vinci.cae.models.SelectionMatch;
import be.vinci.cae.models.Team;
import be.vinci.cae.repositories.MatchRepository;
import be.vinci.cae.repositories.SelectionMatchRepository;
import be.vinci.cae.repositories.TournamentRepository;
import be.vinci.cae.repositories.UserRepository;
import be.vinci.cae.services.InscriptionTournamentService;
import be.vinci.cae.services.MatchService;
import be.vinci.cae.services.TournamentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Date;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class MatchServiceTests {

  private MatchRepository matchRepository;
  private TournamentService tournamentService;
  private InscriptionTournamentService inscriptionTournamentService;
  private SelectionMatchRepository selectionMatchRepository;
  private UserRepository userRepository;
  private TournamentRepository tournamentRepository;

  private MatchService matchService;

  @BeforeEach
  void setUp() {
    matchRepository = mock(MatchRepository.class);
    tournamentService = mock(TournamentService.class);
    inscriptionTournamentService = mock(InscriptionTournamentService.class);
    selectionMatchRepository = mock(SelectionMatchRepository.class);
    userRepository = mock(UserRepository.class);

    matchService = new MatchService(
        matchRepository,
        tournamentService,
        inscriptionTournamentService,
        selectionMatchRepository,
        userRepository,
        tournamentRepository
    );
  }

  /* ======================================================
     declareForfeit
  ====================================================== */
  @Test
  void declareForfeit_team1() {
    Match match = new Match();
    Team team1 = new Team();
    Team team2 = new Team();

    match.setTeam1(team1);
    match.setTeam2(team2);

    when(matchRepository.save(any())).thenAnswer(i -> i.getArgument(0));

    Match result = matchService.declareForfeit(match, team1);

    assertEquals(-1, result.getResultTeam1());
    assertEquals(0, result.getResultTeam2());
    assertEquals("TERMINED", result.getStatus());
  }

  @Test
  void declareForfeit_team2() {
    Match match = new Match();
    Team team1 = new Team();
    Team team2 = new Team();

    match.setTeam1(team1);
    match.setTeam2(team2);

    when(matchRepository.save(any())).thenAnswer(i -> i.getArgument(0));

    Match result = matchService.declareForfeit(match, team2);

    assertEquals(0, result.getResultTeam1());
    assertEquals(-1, result.getResultTeam2());
    assertEquals("TERMINED", result.getStatus());
  }

  /* ======================================================
     setResultat (cas normal)
  ====================================================== */
  @Test
  void setResultat_ok() {
    Match match = new Match();
    match.setId(5L);
    match.setDateTime(new Date(System.currentTimeMillis() - 10000));
    match.setTeam1(new Team());
    match.setTeam2(new Team());
    match.setStatus("PLANNED");

    when(matchRepository.findById(5L)).thenReturn(Optional.of(match));

    SelectionMatch sm1 = mock(SelectionMatch.class);
    SelectionMatch sm2 = mock(SelectionMatch.class);
    SelectionMatch sm3 = mock(SelectionMatch.class);
    SelectionMatch sm4 = mock(SelectionMatch.class);
    SelectionMatch sm5 = mock(SelectionMatch.class);
    SelectionMatch sm6 = mock(SelectionMatch.class);
    SelectionMatch sm7 = mock(SelectionMatch.class);
    SelectionMatch sm8 = mock(SelectionMatch.class);

    when(sm1.getTeam()).thenReturn(match.getTeam1());
    when(sm2.getTeam()).thenReturn(match.getTeam1());
    when(sm3.getTeam()).thenReturn(match.getTeam1());
    when(sm4.getTeam()).thenReturn(match.getTeam1());
    when(sm5.getTeam()).thenReturn(match.getTeam2());
    when(sm6.getTeam()).thenReturn(match.getTeam2());
    when(sm7.getTeam()).thenReturn(match.getTeam2());
    when(sm8.getTeam()).thenReturn(match.getTeam2());

    when(selectionMatchRepository.getByMatch(match))
        .thenReturn(List.of(sm1, sm2, sm3, sm4, sm5, sm6, sm7, sm8));

    when(matchRepository.save(any())).thenAnswer(i -> i.getArgument(0));

    MatchResultDto dto = new MatchResultDto();
    dto.setResultTeam1(3);
    dto.setResultTeam2(1);

    Match result = matchService.setResultat(5L, dto);

    assertEquals(3, result.getResultTeam1());
    assertEquals(1, result.getResultTeam2());
    assertEquals("TERMINED", result.getStatus());
  }

  /* ======================================================
     contested
  ====================================================== */
  @Test
  void contested_by_team1() {
    Match match = new Match();
    Team team1 = new Team();
    Team team2 = new Team();

    match.setTeam1(team1);
    match.setTeam2(team2);

    when(matchRepository.save(any())).thenAnswer(i -> i.getArgument(0));

    Match result = matchService.contested(match, team1);

    assertTrue(result.isTeam1contested());
    assertEquals("CONTESTED", result.getStatus());
  }

  /* ======================================================
     valided
  ====================================================== */
  @Test
  void valided_by_team1() {
    Match match = new Match();
    Team team1 = new Team();
    Team team2 = new Team();

    match.setTeam1(team1);
    match.setTeam2(team2);

    when(matchRepository.save(any())).thenAnswer(i -> i.getArgument(0));

    Match result = matchService.valided(match, team1);

    assertTrue(result.isTeam1Validated());
    assertEquals("VALIDATE_BY_TEAM1", result.getStatus());
  }
}