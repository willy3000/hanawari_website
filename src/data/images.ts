function unsplash(id: string, params: string) {
  return `https://images.unsplash.com/${id}?${params}&auto=format&fit=crop&ixlib=rb-4.1.0`;
}

const QUALITY = "q=70";

export const CHILI_TEXTURE = {
  src: unsplash("photo-1629261636338-786d7b6f772c", `${QUALITY}&w=2000`),
  alt: "",
};

export const SMOKY_TEXTURE = {
  src: unsplash("photo-1762267682918-5b3e10fe0b08", `${QUALITY}&w=2000`),
  alt: "",
};

export const TOMATO_TEXTURE = {
  src: unsplash("photo-1633397517223-9f900fc48e9e", `${QUALITY}&w=1600`),
  alt: "",
};
