package be.vinci.cae.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Represents a picture entity stored in the database.
 */
@Entity
@Table(name = "pictures")
public class Picture {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private long id;

  @Column(nullable = false, unique = true)
  private String link;

  /**
   * Gets the ID of the picture.
   *
   * @return the picture ID
   */
  public long getId() {
    return id;
  }

  /**
   * Gets the link of the picture.
   *
   * @return the picture link
   */
  public String getLink() {
    return link;
  }

  /**
   * Sets the ID of the picture.
   *
   * @param id the picture ID
   */
  public void setId(long id) {
    this.id = id;
  }

  /**
   * Sets the link of the picture.
   *
   * @param link the picture link
   */
  public void setLink(String link) {
    this.link = link;
  }
}
