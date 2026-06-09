import { getDogImagePath } from "../../utils/imagePath";

function AnimalImage({ animal, className = "" }) {
  const src = getDogImagePath(animal?.photos?.[0]);

  return (
    <img
      className={`animal-image ${className}`}
      src={src}
      alt={animal?.name || "Community animal"}
      onError={(event) => {
        event.currentTarget.src = "/images/dog/default-dog.jpg";
      }}
    />
  );
}

export default AnimalImage;