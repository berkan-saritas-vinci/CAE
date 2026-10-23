package be.vinci.cae;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;

import be.vinci.cae.dto.AuthenticatedUser;
import be.vinci.cae.dto.Credentials;
import be.vinci.cae.dto.LoginCredentials;
import be.vinci.cae.models.Picture;
import be.vinci.cae.models.Speciality;
import be.vinci.cae.models.Team;
import be.vinci.cae.models.User;
import be.vinci.cae.repositories.UserRepository;
import be.vinci.cae.services.PictureService;
import be.vinci.cae.services.SpecialityService;
import be.vinci.cae.services.TeamService;
import be.vinci.cae.services.UserService;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import io.github.cdimascio.dotenv.Dotenv;
import java.sql.Date;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;


public class UserServiceTests {

  private UserRepository userRepository;
  private BCryptPasswordEncoder passwordEncoder;
  private PictureService pictureService;
  private SpecialityService specialityService;
  private TeamService teamService;
  private UserService userService;
  private Credentials credentials;
  private User user;


  @BeforeEach
  void setUp() {


    Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();
    System.setProperty("JWT_SECRET", dotenv.get("JWT_SECRET", "TEST_SECRET"));

    userRepository = Mockito.mock(UserRepository.class);
    passwordEncoder = Mockito.mock(BCryptPasswordEncoder.class);
    pictureService = Mockito.mock(PictureService.class);
    specialityService = Mockito.mock(SpecialityService.class);
    teamService = Mockito.mock(TeamService.class);

    userService = new UserService(
      userRepository,
      passwordEncoder,
      pictureService,
      specialityService,
      teamService
    );

    userService.init();

     credentials = new Credentials(
      "/src/assets/avatars/avatar3.jpg",
      "Ichigo@mail.com",
      "Itsugo123*",
      "Itsugo",
      "Tacticien",
      "USER",
      Date.from(Instant.now())
    );

     user = new User();
     user.setId(10);
     user.setMail("mehmet@mail.com");
     user.setPassword("Mehmet123*");
     user.setRole("USER");

  }


  @Test
  void register() {

    Picture picture = new Picture();
    picture.setLink("/src/assets/avatars/avatar3.jpg");
    Speciality speciality = new Speciality();
    speciality.setSpeciality("Tacticien");

    Mockito.when(pictureService.findByLink("/src/assets/avatars/avatar3.jpg"))
      .thenReturn(picture);
    Mockito.when(specialityService.findBySpeciality("Tacticien"))
      .thenReturn(speciality);

    Mockito.when(passwordEncoder.encode("Itsugo123*")).thenReturn("encodePwd");

    userService.register(credentials);
    Mockito.verify(userRepository, Mockito.times(1)).save(any(User.class));

  }

  @Test
  void login() {

    LoginCredentials login = new LoginCredentials(
      "Ichigo@mail.com",
      "Itsugo123*"
    );

    Mockito.when(userRepository.findByMail("Ichigo@mail.com")).thenReturn(user);
    Mockito.when(passwordEncoder.matches("Itsugo123*", "Mehmet123*")).thenReturn(true);

    AuthenticatedUser result = userService.login(login);

    assertNotNull(result);
    assertEquals("Ichigo@mail.com", result.mail());
    assertNotNull(result.token());
    assertEquals(10L, result.id());
    assertEquals("USER", result.role());

  }

  @Test
  void loginReturnsNullWhenCredentialsAreNull() {
    assertNull(userService.login(null));
  }

  @Test
  void loginReturnsNullWhenMailOrPasswordIsNull() {
    assertNull(userService.login(new LoginCredentials(null, "x")));
    assertNull(userService.login(new LoginCredentials("mail@test.com", null)));
  }

  @Test
  void loginReturnsNullWhenUserNotFound() {
    LoginCredentials login = new LoginCredentials("none@mail.com", "pass");
    Mockito.when(userRepository.findByMail("none@mail.com")).thenReturn(null);

    assertNull(userService.login(login));
  }

  @Test
  void loginReturnsNullWhenPasswordDoesNotMatch() {
    LoginCredentials login = new LoginCredentials("Ichigo@mail.com", "wrong");

    Mockito.when(userRepository.findByMail("Ichigo@mail.com")).thenReturn(user);
    Mockito.when(passwordEncoder.matches("wrong", "Mehmet123*")).thenReturn(false);

    assertNull(userService.login(login));

  }

  @Test
  void registerAndGet() {

    Picture picture = new Picture();
    picture.setLink("/src/assets/avatars/avatar3.jpg");
    Speciality speciality = new Speciality();
    speciality.setSpeciality("Tacticien");

    Mockito.when(pictureService.findByLink("/src/assets/avatars/avatar3.jpg"))
      .thenReturn(picture);
    Mockito.when(specialityService.findBySpeciality("Tacticien"))
      .thenReturn(speciality);

    Mockito.when(passwordEncoder.encode("Itsugo123*")).thenReturn("encodePwd");

    Mockito.when(userRepository.save(any(User.class)))
      .thenAnswer(invocation -> invocation.getArgument(0));

    User savedUser = userService.registerAndGet(credentials);

    assertNotNull(savedUser);
    assertEquals("Ichigo@mail.com", savedUser.getMail());
    assertEquals("USER", savedUser.getRole());

  }

  @Test
  void quitTeam() {

    Team team = new Team();
    team.setName("BLEACH");

    user.setId(15);
    Long idUser = user.getId();
    user.setTeam(team);

    Mockito.when(userRepository.findById(Long.valueOf(idUser)))
      .thenReturn(Optional.of(user));

    Mockito.when(userRepository.save(any(User.class)))
      .thenAnswer(invocation -> invocation.getArgument(0));

    User updatedUser = userService.quitTeam(idUser);

    assertNull(updatedUser.getTeam());
    Mockito.verify(userRepository).save(user);
  }

  @Test
  void quitTeamThrowsWhenUserNotFound() {
    Mockito.when(userRepository.findById(Long.valueOf(404L)))
      .thenReturn(Optional.empty());

    RuntimeException ex = assertThrows(RuntimeException.class,
      () -> userService.quitTeam(404L));

    assertEquals("Utilisateur introuvable", ex.getMessage());
  }

  @Test
   void setTeam() {

    Team team = new Team();
    team.setName("AlphaRomeo");

    Long idTeam = 1L;

    Mockito.when(teamService.getById(idTeam)).thenReturn(Optional.of(team));

    userService.setTeam(idTeam, user);

    assertNotNull(user.getTeam());
    assertEquals(team, user.getTeam());

    Mockito.verify(teamService, Mockito.times(1)).getById(idTeam);

  }

  @Test
  void setTeamSetsNullWhenTeamNotFound() {
    Long idTeam = 999L;
    user.setTeam(new Team());
    Mockito.when(teamService.getById(idTeam)).thenReturn(Optional.empty());

    userService.setTeam(idTeam, user);

    assertNull(user.getTeam());
  }

  @Test
  void setRoleTo() {

    String userRole = user.getRole();
    userService.setRoleTo(user);

    if(userRole.equals("USER")){
      assertEquals("ADMIN", user.getRole());
    } else {
      assertEquals("USER", user.getRole());
    }

    Mockito.verify(userRepository, Mockito.times(1)).save(user);

  }

  @Test
  void setRoleToSwitchesAdminToUser() {
    user.setRole("ADMIN");

    userService.setRoleTo(user);

    assertEquals("USER", user.getRole());
    Mockito.verify(userRepository, Mockito.times(1)).save(user);
  }

  @Test
  void setUserRoleToUserSetsUserRole() {
    user.setRole("ADMIN");
    userService.setUserRoleToUser(user);
    assertEquals("USER", user.getRole());
  }

  @Test
  void updateRole() {

    User user1 = new User();
    user1.setId(50L);
    user1.setRole("USER");
    Long idUser = user1.getId();

    Mockito.when(userRepository.findById(Long.valueOf(idUser)))
        .thenReturn(Optional.of(user1));

    Mockito.when(userRepository.save(any(User.class)))
      .thenAnswer(inv -> inv.getArgument(0));

    User updated = userService.updateRole(idUser, "ADMIN");

    assertEquals("ADMIN", updated.getRole());
    assertEquals("ADMIN", user1.getRole());

    Mockito.verify(userRepository, Mockito.times(1)).findById(idUser);
    Mockito.verify(userRepository, Mockito.times(1)).save(user1);

  }

  @Test
  void updateRoleThrowsWhenUserNotFound() {
    Mockito.when(userRepository.findById(Long.valueOf(404L)))
      .thenReturn(Optional.empty());

    RuntimeException ex = assertThrows(RuntimeException.class,
      () -> userService.updateRole(404L, "ADMIN"));

    assertEquals("Utilisateur introuvable", ex.getMessage());
  }

  @Test
  void updateRoleThrowsWhenRoleIsInvalid() {
    User user1 = new User();
    user1.setId(50L);
    user1.setRole("USER");

    Mockito.when(userRepository.findById(Long.valueOf(50L)))
      .thenReturn(Optional.of(user1));

    IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
      () -> userService.updateRole(50L, "MODERATOR"));

    assertEquals("Rôle invalide", ex.getMessage());
  }

  @Test
  void verifyJwtToken() {

    String secret = System.getProperty("JWT_SECRET");
    Algorithm algo = Algorithm.HMAC256(secret);

    String token = JWT.create()
      .withIssuer("auth0")
      .withClaim("mail", "Ichigo@mail.com")
      .sign(algo);

    String mail = userService.verifyJwtToken(token);
    assertEquals("Ichigo@mail.com", mail);
  }

  @Test
  void verifyJwtTokenReturnsNullWhenTokenInvalid() {
    String mail = userService.verifyJwtToken("invalid.token.value");
    assertNull(mail);
  }

  @Test
  void initThrowsWhenSecretMissingEverywhere() {
    String previous = System.getProperty("JWT_SECRET");
    try {
      System.clearProperty("JWT_SECRET");

      UserService serviceWithoutSecret = new UserService(
        userRepository,
        passwordEncoder,
        pictureService,
        specialityService,
        teamService
      );

      IllegalStateException ex = assertThrows(IllegalStateException.class,
        serviceWithoutSecret::init);
      assertEquals("JWT_SECRET est manquant !", ex.getMessage());
    } finally {
      if (previous != null) {
        System.setProperty("JWT_SECRET", previous);
      }
    }
  }

  @Test
  void findByIdReturnsRepositoryValue() {
    User u = new User();
    u.setId(88L);
    Mockito.when(userRepository.findById(88L)).thenReturn(u);

    User result = userService.findById(88L);
    assertSame(u, result);
  }

  @Test
  void getUsersByTeam() {

    Team team = new Team();
    team.setName("Bravo");

    Long idTeam = 1L;

    User user1 = new User();
    User user2 = new User();

    user1.setTeam(team);
    user2.setTeam(team);

    Mockito.when(userRepository.findByTeamId(idTeam))
      .thenReturn(List.of(user1, user2));

    List<User> result = userService.getUsersByTeam(idTeam);

    assertEquals(2, result.size());
    Mockito.verify(userRepository, Mockito.times(1)).findByTeamId(idTeam);

  }

  @Test
  void getUsersByRoleReturnsRepositoryValue() {
    User admin = new User();
    admin.setRole("ADMIN");
    Mockito.when(userRepository.findByRole("ADMIN")).thenReturn(List.of(admin));

    List<User> result = userService.getUsersByRole("ADMIN");
    assertEquals(1, result.size());
    assertSame(admin, result.get(0));
  }

  @Test
  void getAllUsersReturnsAllRepositoryUsers() {
    User u1 = new User();
    User u2 = new User();
    Mockito.when(userRepository.findAll()).thenReturn(List.of(u1, u2));

    List<User> result = userService.getAllUsers();
    assertEquals(2, result.size());
    assertTrue(result.contains(u1));
    assertTrue(result.contains(u2));
  }

  @Test
  void findByTagReturnsRepositoryValue() {
    user.setTag("ichigo");
    Mockito.when(userRepository.findByTag("ichigo")).thenReturn(user);

    User result = userService.findByTag("ichigo");
    assertSame(user, result);
  }

  @Test
  void findByMail() {

    user.setMail("Ichigo@mail.com");
    String mail = user.getMail();


    Mockito.when(userRepository.findByMail(mail)).thenReturn(user);
    User foundedUser = userService.findByMail(mail);

    assertNotNull(foundedUser);
    assertEquals(user, foundedUser);

    Mockito.verify(userRepository, Mockito.times(1)).findByMail(mail);

  }

  @Test
  void saveDelegatesToRepository() {
    User toSave = new User();
    toSave.setId(123L);
    Mockito.when(userRepository.save(toSave)).thenReturn(toSave);

    User result = userService.save(toSave);
    assertSame(toSave, result);
  }


}
