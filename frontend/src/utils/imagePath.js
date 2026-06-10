const imageExtensionFixes = {
  "dog_001_kaalu_front.jpg": "dog_001_kaalu_front.jpeg",
  "dog_002_sheru.jpg": "dog_002_sheru.jpeg",
  "dog_003_raja.jpg": "dog_003_raja.jpeg",
  "dog_004_sona.jpg": "dog_004_sona.jpeg",
  "dog_005_bholu.jpg": "dog_005_bholu.jpeg",
  "dog_006_rocky.jpg": "dog_006_rocky.jpeg",
  "dog_007_moti.jpg": "dog_007_moti.jpeg",
  "dog_008_chintu.jpg": "dog_008_chintu.jpeg",

  "Demo_dog.jpg": "Demo_dog.png",
  "Demo_dog.jpeg": "Demo_dog.png",
  "demo_dog.jpg": "Demo_dog.png",
  "demo_dog.jpeg": "Demo_dog.png",
};

export const getDogImagePath = (photoPath) => {
  if (!photoPath) return "/images/dog/Demo_dog.png";

  if (photoPath.startsWith("http://") || photoPath.startsWith("https://")) {
    return photoPath;
  }

  const fileName = photoPath.split("/").pop();

  const fixedFileName =
    imageExtensionFixes[fileName] ||
    fileName.replace(".jpg", ".jpeg");

  return `/images/dog/${fixedFileName}`;
};