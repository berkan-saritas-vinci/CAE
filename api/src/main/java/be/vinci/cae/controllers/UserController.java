package be.vinci.cae.controllers;

import be.vinci.cae.dto.AuthenticatedUser;
import be.vinci.cae.dto.ChangePasswordDto;
import be.vinci.cae.dto.Credentials;
import be.vinci.cae.dto.LoginCredentials;
import be.vinci.cae.models.User;
import be.vinci.cae.services.PictureService;
import be.vinci.cae.services.SpecialityService;
import be.vinci.cae.services.TeamService;
import be.vinci.cae.services.UserService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/**
 * REST controller for user authentication operations.
 *
 * <p>All endpoints are exposed under the base path <code>/auths</code>. The
 * controller delegates core authentication logic to {@link UserService}.</p>
 */
@RestController
@RequestMapping("/auths")
public class UserController {

  private record AuthUserResolution(User user, ResponseEntity<Map<String, String>> errorResponse) {
  }

  private final UserService userService;
  private final PictureService pictureService;
  private final SpecialityService specialityService;
  private final BCryptPasswordEncoder passwordEncoder;
  private final TeamService teamService;

  /**
   * Creates the controller.
   *
   * @param userService user service.
   * @param pictureService picture service.
   * @param specialityService speciality service.
   * @param passwordEncoder password encoder.
   */
  public UserController(
      UserService userService,
      PictureService pictureService,
      SpecialityService specialityService,
      BCryptPasswordEncoder passwordEncoder,
      TeamService teamService
  ) {
    this.userService = userService;
    this.pictureService = pictureService;
    this.specialityService = specialityService;
    this.passwordEncoder = passwordEncoder;
    this.teamService = teamService;
  }

  /**
   * Registers a new user account.
   *
   * @param credentials registration data.
   * @return response entity with success message.
   */
  @PostMapping("/register")
  @PreAuthorize("isAnonymous()")
  @ResponseStatus(HttpStatus.CREATED)
  public ResponseEntity<Map<String, String>> register(
      @Valid @RequestBody Credentials credentials
  ) {

    User bannnedUser = userService.findByMail(credentials.mail());

    if (bannnedUser != null && "BANNED".equals(bannnedUser.getRole())) {
      throw new ResponseStatusException(
        HttpStatus.FORBIDDEN,
        "Cette adresse mail est bannie et ne peut pas être réutilisée."
      );
    }

    if (bannnedUser != null) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Mail already exists.");
    }

    userService.register(credentials);
    return ResponseEntity.status(HttpStatus.CREATED)
      .body(Map.of("message", "User registered successfully"));
  }

  /**
   * Authenticates a user and returns a JWT.
   *
   * @param credentials login data.
   * @return authenticated user payload.
   */
  @PostMapping("/login")
  @PreAuthorize("isAnonymous()")
  public AuthenticatedUser login(@Valid @RequestBody LoginCredentials credentials) {
    AuthenticatedUser authUser = userService.login(credentials);
    User bannedUser = userService.findByMail(credentials.mail());

    if (authUser == null) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
    }

    if ("BANNED".equals(bannedUser.getRole())) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Utilisateur banni");
    }

    return authUser;
  }

  /**
   * Get a user profil by his Id.
   *
   * @param id the user's Id
   * @return the user's informations.
   */
  @GetMapping("/{id}")
  @PreAuthorize("isAuthenticated() OR isAnonymous()") // à verifier
  public Credentials getUserProfile(@PathVariable Long id) {
    User user = userService.findById(id);
    if (user == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
    }
    String picture = user.getPicture() != null ? user.getPicture().getLink() : null;
    String speciality = user.getSpeciality() != null
        ? user.getSpeciality().getSpeciality()
        : null;

    return new Credentials(
        picture,
        user.getMail(),
        null,
        user.getTag(),
        speciality,
        user.getRole(),
        user.getCreatedAt()
    );
  }

  /**
   * Updates the profile of the authenticated user.
   * The user is identified using the JWT token in the Authorization header.
   * Allows updating speciality, picture, or password.
   *
   * @param authorization the Bearer JWT token
   * @param updates the profile fields to update
   * @return a success message if the profile was updated
   */
  @PutMapping("/users/me")
  public ResponseEntity<Map<String, String>> updateProfile(
      @RequestHeader("Authorization") String authorization,
      @RequestBody Map<String, String> updates) {

    AuthUserResolution resolution = resolveAuthenticatedUser(authorization);
    if (resolution.errorResponse() != null) {
      return resolution.errorResponse();
    }
    User user = resolution.user();

    if (updates.containsKey("speciality")) {
      var speciality = specialityService.findBySpeciality(updates.get("speciality"));
      if (speciality != null) {
        user.setSpeciality(speciality);
      }
    }

    if (updates.containsKey("picture")) {

      var picture = pictureService.findByLink(updates.get("picture"));
      if (picture != null) {
        user.setPicture(picture);
      }
    }

    if (updates.containsKey("password") && !updates.get("password").isEmpty()) {
      user.setPassword(passwordEncoder.encode(updates.get("password")));
    }

    userService.save(user);

    return ResponseEntity.ok(Map.of("message", "Profil mis à jour"));
  }

  /**
   * Changes the password of the authenticated user.
   * The user must provide their current password and a new password.
   *
   * @param authorization the Bearer JWT token
   * @param request contains the old and new password
   * @return a success message if the password was updated
   */
  @PutMapping("/users/me/password")
  @PreAuthorize("isAuthenticated() ")
  public ResponseEntity<Map<String, String>> changePassword(
      @RequestHeader("Authorization") String authorization,
      @RequestBody ChangePasswordDto request) {

    AuthUserResolution resolution = resolveAuthenticatedUser(authorization);
    if (resolution.errorResponse() != null) {
      return resolution.errorResponse();
    }
    User user = resolution.user();

    if (!passwordEncoder.matches(request.oldPassword(), user.getPassword())) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
        .body(Map.of("message", "Ancien mot de passe incorrect"));
    }

    user.setPassword(passwordEncoder.encode(request.newPassword()));

    userService.save(user);

    return ResponseEntity.ok(Map.of("message", "Mot de passe modifié"));
  }

  /**
   * Returns all users with role ADMIN (qu'ils soient en mode User ou Admin).
   *
   * @return list of admin users
   */
  @GetMapping("/users/admins")
  public ResponseEntity<List<User>> getAdminUsers() {
    List<User> admins = userService.getUsersByRole("ADMIN");
    return ResponseEntity.ok(admins);
  }

  /**
   * Returns all users.
   *
   * @return list of users.
   */
  @GetMapping("/users")
  @PreAuthorize("isAuthenticated() OR isAnonymous()")
  public ResponseEntity<List<User>> getAllUsers() {
    return ResponseEntity.ok(userService.getAllUsers());
  }

  /**
   * Returns all users in a team.
   *
   * @param teamId team identifier.
   * @return list of users.
   */
  @GetMapping("/users/team/{teamId}")
  @PreAuthorize("isAuthenticated() OR isAnonymous()")
  public List<User> getUsersByTeam(@PathVariable Long teamId) {
    return userService.getUsersByTeam(teamId);
  }

  /**
   * Removes a user from a team.
   *
   * @param id user identifier.
   * @return updated user.
   */
  @PutMapping("/users/{id}/quit-team")
  public User quitTeam(@PathVariable Long id) {

    User user = userService.findById(id);

    if (user == null) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found.");
    }

    return userService.quitTeam(id);
  }

  /**
   * Returns a user by id.
   *
   * @param id user identifier.
   * @return user response or 404 if not found.
   */
  @GetMapping("/users/{id}")
  @PreAuthorize("isAuthenticated() OR isAnonymous()") // à vérifier
  public ResponseEntity<User> getUser(@PathVariable Long id) {
    User user = userService.findById(id);
    if (user == null) {
      return ResponseEntity.notFound().build();
    }
    return ResponseEntity.ok(user);
  }

  private AuthUserResolution resolveAuthenticatedUser(String authorization) {
    String token = authorization.replace("Bearer ", "");
    String email = userService.verifyJwtToken(token);

    if (email == null) {
      return new AuthUserResolution(null, unauthorizedResponse());
    }

    User user = userService.findByMail(email);
    if (user == null) {
      return new AuthUserResolution(null, userNotFoundResponse());
    }

    if ("BANNED".equals(user.getRole())) {
      return new AuthUserResolution(
          null,
          ResponseEntity.status(HttpStatus.FORBIDDEN)
              .body(Map.of("message", "Utilisateur banni"))
      );
    }
    return new AuthUserResolution(user, null);
  }

  private ResponseEntity<Map<String, String>> unauthorizedResponse() {
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
      .body(Map.of("message", "Token invalide"));
  }

  private ResponseEntity<Map<String, String>> userNotFoundResponse() {
    return ResponseEntity.status(HttpStatus.NOT_FOUND)
      .body(Map.of("message", "Utilisateur introuvable"));
  }

  /**
   * Registers a new user and returns the created user entity.
   *
   * @param credentials registration data.
   * @return response entity with created user.
   */
  @PostMapping("/register-and-get")
  @PreAuthorize("isAnonymous() OR isAuthenticated()")
  public ResponseEntity<User> registerAndGet(
      @Valid @RequestBody Credentials credentials
  ) {
    User findUser = userService.findByMail(credentials.mail());

    if (findUser != null && "BANNED".equals(findUser.getRole())) {
      throw new ResponseStatusException(
          HttpStatus.FORBIDDEN,
          "Cette adresse mail est bannie et ne peut pas être réutilisée."
      );
    }

    if (findUser != null) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Mail already exists.");
    }

    User user = userService.registerAndGet(credentials);

    return ResponseEntity.status(HttpStatus.CREATED).body(user);
  }

  /**
   * Returns a user by tag.
   *
   * @param tag user tag.
   * @return user response or 404 if not found.
   */
  @GetMapping("/users/tag/{tag}")
  @PreAuthorize("isAuthenticated() OR isAnonymous()")
  public ResponseEntity<User> getUserByTag(@PathVariable String tag) {
    User user = userService.findByTag(tag);
    if (user == null) {
      return ResponseEntity.notFound().build();
    }
    return ResponseEntity.ok(user);
  }

  /**
   * Toggles a user's role between USER and ADMIN.
   *
   * @param userId user identifier.
   * @return updated user response or 404 if not found.
   */
  @GetMapping("/users/setRole/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<User> setAdmin(@PathVariable("id") long userId) {
    User user = userService.findById(userId);
    if (user == null) {
      return ResponseEntity.notFound().build();
    }
    if ("BANNED".equals(user.getRole())) {
      return ResponseEntity.status(HttpStatus.FORBIDDEN)
        .body(null);
    }
    User updatedUser = userService.setRoleTo(user);
    return ResponseEntity.ok(updatedUser);
  }

  /**
   * Bans a user by setting their role to "BANNED".
   *
   * <p>Un utilisateur banni ne peut plus se connecter ni recréer un compte
   * avec la même adresse mail.</p>
   *
   * @param id l'identifiant de l'utilisateur à bannir
   * @return l'utilisateur mis à jour ou 404 s'il n'existe pas
   */
  @PutMapping("/users/{id}/ban")
  public ResponseEntity<User> banUser(@PathVariable Long id) {

    User user = userService.findById(id);
    if (user == null) {
      return ResponseEntity.notFound().build();
    }

    // Bannir l'utilisateur
    user.setRole("BANNED");
    userService.save(user);


    // Delegate team member removal and potential reassign to TeamService
    teamService.handleMemberRemovalAndReassign(id);

    return ResponseEntity.ok(user);
  }
}
