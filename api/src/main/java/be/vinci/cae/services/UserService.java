package be.vinci.cae.services;

import be.vinci.cae.dto.AuthenticatedUser;
import be.vinci.cae.dto.Credentials;
import be.vinci.cae.dto.LoginCredentials;
import be.vinci.cae.models.Team;
import be.vinci.cae.models.User;
import be.vinci.cae.repositories.UserRepository;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import jakarta.annotation.PostConstruct;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.StreamSupport;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/**
 * Service responsible for managing users and authentication.
 * This class handles the core business logic related to user management,
 * including user registration, authentication, JWT token generation,
 * token verification, and retrieving users from the database.
 * Passwords are securely stored using BCrypt hashing. Authentication
 * is implemented using JSON Web Tokens (JWT) which allow users to
 * access protected resources after successful login.
 * The service interacts with {@link UserRepository} for database
 * operations and uses {@link BCryptPasswordEncoder} to encode
 * and verify user passwords.
 */
@Service
public class UserService {

  private static final long JWT_LIFETIME = 24 * 60 * 60 * 1000; // 24h (ms)

  @Value("${JWT_SECRET:secret-for-tests}")
  private String jwtSecret;
  private final UserRepository userRepository;
  private final BCryptPasswordEncoder passwordEncoder;
  private Algorithm jwtAlgorithm;
  private final PictureService pictureService;
  private final SpecialityService specialityService;
  private final TeamService teamService;

  /**
   * Creates a user service.
   *
   * @param userRepository repository used for user persistence.
   * @param passwordEncoder encoder used to hash and verify passwords.
   * @param pictureService service used to resolve user pictures.
   * @param specialityService service used to resolve user specialities.
   * @param teamService service used to manage user teams.
   */
  public UserService(
      UserRepository userRepository,
      BCryptPasswordEncoder passwordEncoder,
      PictureService pictureService,
      SpecialityService specialityService,
      TeamService teamService
  ) {
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
    this.pictureService = pictureService;
    this.specialityService = specialityService;
    this.teamService = teamService;

  }

  /**
   * Initializes the algorithm used to sign JWTs after dependency
   * and configuration value injection.
   * This method is automatically called by Spring after the bean is created.
   */

  @PostConstruct
  public void init() {
    if (jwtSecret == null) {
      jwtSecret = System.getProperty("JWT_SECRET");
    }

    if (jwtSecret == null) {
      throw new IllegalStateException("JWT_SECRET est manquant !");
    }

    this.jwtAlgorithm = Algorithm.HMAC256(jwtSecret);
  }

  /**
   * Registers a new user in the database.
   * The password is encoded using BCrypt before being saved.
   * The default role assigned to the user is "USER".
   *
   * @param credentials the information required to create the user
   *                    (email, password, image, tag, speciality).
   */
  public void register(Credentials credentials) {

    User user = buildUser(credentials);
    userRepository.save(user);
  }

  /**
   * Authenticates a user using their credentials.
   *
   * @param credentials the user's login credentials (email and password).
   * @return an {@link AuthenticatedUser} object containing the email and JWT
   *         if authentication succeeds, otherwise null.
   */
  public AuthenticatedUser login(LoginCredentials credentials) {
    if (credentials == null || credentials.mail() == null || credentials.password() == null) {
      return null;
    }
    User user = userRepository.findByMail(credentials.mail());
    if (user == null || !passwordEncoder.matches(credentials.password(), user.getPassword())) {
      return null;
    }

    return createJwtToken(credentials.mail(), user.getId(), user.getRole());
  }

  /**
   * Generates a JWT token for an authenticated user.
   *
   * @param mail the email of the user for whom the token is generated.
   * @param id the ID of the user.
   * @param role the role of the user.
   * @return an {@link AuthenticatedUser} object containing the email and the JWT token.
   */
  private AuthenticatedUser createJwtToken(String mail, long id, String role) {
    String token = JWT.create()
        .withIssuer("auth0")
        .withClaim("mail", mail)
        .withIssuedAt(new Date())
        .withExpiresAt(new Date(System.currentTimeMillis() + JWT_LIFETIME))
        .sign(jwtAlgorithm);
    return new AuthenticatedUser(mail, token, id, role);
  }

  /**
   * Verifies the validity of a JWT token and extracts the email it contains.
   *
   * @param token the JWT token to verify.
   * @return the email contained in the token if it is valid,
   *         otherwise null if the token is invalid or expired.
   */
  public String verifyJwtToken(String token) {
    try {
      return JWT.require(jwtAlgorithm).build().verify(token).getClaim("mail").asString();
    } catch (Exception e) {
      return null;
    }
  }

  /**
   * Retrieves a user by ID.
   *
   * @param id the user ID.
   * @return the user if found, null otherwise.
   */
  public User findById(long id) {
    return userRepository.findById(id);
  }

  /**
   * Retrieves all users that belong to a specific team.
   *
   * @param teamId the ID of the team.
   * @return a {@link List} of {@link User} objects that are members of the team.
   */
  public List<User> getUsersByTeam(Long teamId) {
    return userRepository.findByTeamId(teamId);
  }

  /**
   * Allows a user to quit their current team.
   *
   * @param userId the ID of the user who wants to leave the team.
   * @return the updated {@link User} object after removing its team reference.
   * @throws ResponseStatusException if the user with the given ID is not found.
   */
  public User quitTeam(Long userId) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
    user.setTeam(null);
    return userRepository.save(user);
  }

  /**
   * Assigns a user to a team.
   *
   * @param teamId the ID of the team.
   * @param user the {@link User} to assign to the team.
   */
  public void setTeam(long teamId, User user) {
    Optional<Team> team = teamService.getById(teamId);

    user.setTeam(team.orElse(null));
  }

  /**
   * Changes the role of a user to admin.
   *
   * @param user the user to update.
   * @return the updated persisted user.
   */
  public User setRoleTo(User user) {
    if ("USER".equals(user.getRole())) {
      user.setRole("ADMIN");
    } else {
      user.setRole("USER");
    }
    return userRepository.save(user);
  }

  /**
   * Changes the role of a user to regular user.
   *
   * @param user the user to update.
   */
  public void setUserRoleToUser(User user) {
    user.setRole("USER");
  }

  /**
   * Registers a new user and returns the persisted entity.
   *
   * @param credentials the information required to create the user
   *                    (email, password, image, tag, speciality).
   * @return the saved {@link User} object.
   */
  public User registerAndGet(Credentials credentials) {
    return userRepository.save(buildUser(credentials));
  }

  private User buildUser(Credentials credentials) {
    User user = new User();
    user.setPicture(pictureService.findByLink(credentials.picture()));
    user.setMail(credentials.mail());
    user.setPassword(passwordEncoder.encode(credentials.password()));
    user.setTag(credentials.tag());
    user.setSpeciality(specialityService.findBySpeciality(credentials.speciality()));
    user.setRole("USER");
    Date now = new Date(System.currentTimeMillis());
    user.setCreationDate(now);
    return user;
  }

  /**
   * Retrieves all users that belong to a role.
   *
   * @param role of the users.
   * @return a list of the users.
   */
  public List<User> getUsersByRole(String role) {
    return userRepository.findByRole(role);
  }

  /**
   * Retrieves all users.
   *
   * @return list of all users.
   */
  public List<User> getAllUsers() {
    return StreamSupport.stream(userRepository.findAll().spliterator(), false).toList();
  }

  /**
   * Finds a user by tag.
   *
   * @param tag the user tag.
   * @return the matching user, or null if not found.
   */
  public User findByTag(String tag) {
    return userRepository.findByTag(tag);
  }

  /**
   * Finds a user by the mail.
   *
   * @param mail the user mail.
   * @return the matching user, or null if not found.
   */
  public User findByMail(String mail) {

    return userRepository.findByMail(mail);
  }

  /**
   * Met à jour le rôle d'un utilisateur.
   *
   * @param id   l'id de l'utilisateur
   * @param role le nouveau rôle ("USER" ou "ADMIN")
   * @return l'utilisateur mis à jour
   */
  public User updateRole(Long id, String role) {
    User user = userRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

    // Vérifie que le rôle est valide
    if (!"USER".equals(role) && !"ADMIN".equals(role)) {
      throw new IllegalArgumentException("Rôle invalide");
    }

    user.setRole(role);
    return userRepository.save(user);
  }

  /**
   * Met à jour les informations d'un utilisateur.
   *
   * @param user le nouveau user modifié
   * @return l'utilisateur mis à jour
   */
  public User save(User user) {
    return userRepository.save(user);
  }
}
