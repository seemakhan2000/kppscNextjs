
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadBuffer = (buffer, options = {}) =>
  new Promise((resolve, reject) => {
    if (!buffer) {
      return reject(new Error("File buffer is missing."));
    }

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder,
        resource_type: options.resourceType || "image",
        public_id: options.publicId,
        overwrite: false,
      },
      (error, result) => {
        if (error) return reject(error);

        if (!result?.secure_url || !result?.public_id) {
          return reject(new Error("Cloudinary upload failed."));
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          resourceType: result.resource_type,
        });
      }
    );

    stream.end(buffer);
  });

const deleteAsset = async (publicId, resourceType = "image") => {
  if (!publicId) return;

  const result = await cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
    invalidate: true,
  });

  if (!["ok", "not found"].includes(result.result)) {
    throw new Error(`Cloudinary deletion failed: ${result.result}`);
  }

  return result;
};

module.exports = { cloudinary, uploadBuffer, deleteAsset };
