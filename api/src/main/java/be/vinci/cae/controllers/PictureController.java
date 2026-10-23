package be.vinci.cae.controllers;

import be.vinci.cae.models.Picture;
import be.vinci.cae.services.PictureService;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller for managing pictures.
 */
@RestController
@RequestMapping("/pictures/")
public class PictureController {

  private final PictureService pictureService;

  /**
   * Constructor for PictureController.
   *
   * @param pictureService the service used to manage Picture entities
   */
  @Autowired
  public PictureController(PictureService pictureService) {
    this.pictureService = pictureService;
  }

  /**
   * Creates a new Picture in the database.
   * Example request: POST /pictures/create
   *
   * @param picture the Picture object sent in the request body (must include link)
   * @return ResponseEntity containing the created Picture or a bad request if link is missing
   */
  @PostMapping("/create")
  public ResponseEntity<Picture> createPicture(@RequestBody Picture picture) {
    if (picture.getLink() == null || picture.getLink().isEmpty()) {
      return ResponseEntity.badRequest().build();
    }
    Picture savedPicture = pictureService.save(picture);
    return ResponseEntity.ok(savedPicture);
  }

  /**
   * Returns all pictures.
   * Example request: GET /pictures/all
   *
   * @return list of all Picture objects
   */
  @GetMapping("/all")
  public List<Picture> getAllPictures() {
    return pictureService.getAll();
  }
}
