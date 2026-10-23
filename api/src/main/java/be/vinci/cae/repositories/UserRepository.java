package be.vinci.cae.repositories;

import be.vinci.cae.models.User;
import java.util.List;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository for CRUD operations on users.
 */
@Repository
public interface UserRepository extends CrudRepository<User, Long> {

  /**
   * Finds a user by their ID.
   *
   * @param id the user's ID
   * @return the user with the given ID
   */
  User findById(long id);

  /**
   * Finds a user by their email.
   *
   * @param mail the user's email
   * @return the user with the given email
   */
  User findByMail(String mail);

  /**
   * Reads a user by their email.
   *
   * @param mail the user's email
   * @return the user with the given email
   */
  User readByMail(String mail);

  /**
   * Finds all users belonging to a specific team.
   *
   * @param teamId the ID of the team
   * @return the list of users that belong to the given team
   */
  List<User> findByTeamId(long teamId);

  /**
   * Finds all users belonging to a specific role.
   *
   * @param role the user role.
   * @return the list of users that belong to the given role
   */
  List<User> findByRole(String role);

  /**
   * Finds a user by tag.
   *
   * @param tag the user tag.
   * @return the matching user.
   */
  User findByTag(String tag);

  /**
   * Finds users by ID.
   *
   * @param id the user ID.
   * @return the list of matching users.
   */
  List<User> getUsersById(long id);

}

