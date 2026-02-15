import cloudinary from "cloudinary";

cloudinary.v2.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


export const uploadFromUrl = async (url: string, publicId?: string) => {
  try {
    const uploadOptions: any = {
      folder: "members",
    };

    if (publicId) {
      uploadOptions.public_id = publicId;
      uploadOptions.overwrite = true;
    }

    const result = await cloudinary.v2.uploader.upload(url, uploadOptions);
    return result;
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    throw error;
  }
};

export { cloudinary };
