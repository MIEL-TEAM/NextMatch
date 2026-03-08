"use client";
import {
  CldUploadButton,
  CloudinaryUploadWidgetOptions,
  CloudinaryUploadWidgetResults,
} from "next-cloudinary";
import Icon from "@/lib/table/Icon";

type ImageButtonProps = {
  onUploadImage: (result: CloudinaryUploadWidgetResults) => void;
};

interface ExtendedCloudinaryOptions extends CloudinaryUploadWidgetOptions {
  language_direction?: string;
  moderation?: string;
  html_attrs?: {
    dir: "rtl" | "ltr";
  };
  processDirection?: "rtl" | "ltr";
}

export default function ImageButtonUpload({ onUploadImage }: ImageButtonProps) {
  const handleUploadSuccess = (result: CloudinaryUploadWidgetResults) => {
    console.log(
      "📸 Cloudinary Upload Result:",
      JSON.stringify(result, null, 2)
    );
    if (
      result.info &&
      typeof result.info !== "string" &&
      result.info.moderation
    ) {
      console.log(
        "🛡️ Moderation Info:",
        JSON.stringify(result.info.moderation, null, 2)
      );
    }
    onUploadImage(result);
  };

  const cloudinaryOptions: ExtendedCloudinaryOptions = {
    maxFiles: 1,
    language: "he",
    uploadPreset: "nm-demo",
    moderation: "aws_rek",
    language_direction: "rtl",
    html_attrs: {
      dir: "rtl",
    },
    processDirection: "rtl",

    text: {
      he: {
        menu: {
          files: "תמונה חדשה",
          web: "חיפוש באינטרנט",
          camera: "צילום ממצלמה",
          dropbox: "דרופבוקס",
          google_drive: "גוגל דרייב",
        },
        local: {
          browse: "תמונה חדשה",
          dd_title_single: "גרור ושחרר את התמונה כאן",
        },
        actions: {
          upload: "העלה עכשיו",
          cancel: "ביטול",
          remove: "הסר",
        },
        url: {
          title: "כתובת ציבורית של קובץ להעלאה:",
          action: "העלה",
          input_placeholder: "ציבורית של הקובץ להעלאה url הזן כתובת",
        },
        camera: {
          title: "צילום תמונה",
          button: "צלם",
        },
        google_drive: {
          title: "גוגל דרייב",
          button: "בחר",
        },
        dropbox: {
          title: "דרופבוקס",
          button: "בחר",
        },
        or: "או",
        back: "חזור",
        close: "סגור",
      },
    },

    sources: ["local", "url", "camera", "google_drive", "dropbox"],
    defaultSource: "local",
    multiple: false,
    cropping: true,
    croppingAspectRatio: 1,
    folder: "user_uploads",
    singleUploadAutoClose: true,

    styles: {
      fonts: {
        default: null,
        "'Assistant', sans-serif": {
          url: "https://fonts.googleapis.com/css2?family=Assistant:wght@400;700&display=swap",
          active: true,
        },
      },
      common: {
        ".cloudinary-url-input-area": {
          direction: "rtl !important",
          textAlign: "right !important",
        },

        ".cloudinary-url-title": {
          direction: "rtl !important",
          textAlign: "right !important",
          float: "right !important",
        },
      },
    },
  };

  return (
    <CldUploadButton
      options={cloudinaryOptions}
      onSuccess={handleUploadSuccess}
      signatureEndpoint="/api/sign-image"
      uploadPreset="nm-demo"
      className={`flex items-center gap-2 border-2 border-secondary text-secondary rounded-lg py-2 px-4 hover:bg-secondary/10`}
    >
      <Icon name="camera" className="size-6 bg-secondary" />
      העלה תמונה חדשה
    </CldUploadButton>
  );
}
