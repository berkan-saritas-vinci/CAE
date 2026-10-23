package be.vinci.cae.services;

import be.vinci.cae.models.Picture;
import be.vinci.cae.repositories.PictureRepository;
import java.util.List;
import org.springframework.stereotype.Service;

/**
 * Service for picture-related operations.
 */
@Service
public class PictureService {

  private final PictureRepository pictureRepository;

  /**
   * Creates the service.
   *
   * @param pictureRepository picture repository
   */
  public PictureService(PictureRepository pictureRepository) {
    this.pictureRepository = pictureRepository;
  }

  /**
   * Finds a picture by its link.
   *
   * @param link picture link
   * @return the picture if found, otherwise null
   */
  public Picture findByLink(String link) {
    return pictureRepository.findByLink(link);
  }

  public List<Picture> getAll() {
    return pictureRepository.findAll();
  }

  /**
   * Saves a picture in the repository.
   *
   * @param picture the picture to save
   * @return the saved picture
   */
  public Picture save(Picture picture) {
    return pictureRepository.save(picture);
  }

}
