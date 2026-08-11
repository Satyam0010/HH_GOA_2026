import { ChangeEvent, DragEvent, useEffect, useRef, useState } from "react";
import {
  ArrowDownToLine,
  ArrowUpRight,
  Check,
  Hash,
  ImagePlus,
  Loader2,
  Menu,
  RotateCcw,
  Share2,
  Sparkles,
  X,
} from "lucide-react";
import {
  canvasToBlob,
  convertHeic,
  loadImage,
  renderGraphic,
  RenderFormat,
} from "./utils/render";
import { uploadGraphic } from "./services/cloudinary";
import { createShare } from "./services/share";

const MAX_SIZE = 12 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/heic", "image/heif"];

const formatOptions = [
  {
    value: "frame" as const,
    title: "Social Frame",
    subtitle: "For stories, Profiles, and Quick Shares",
    description: "A bold, share-ready frame that keeps your photo front and center.",
  },
  {
    value: "id" as const,
    title: "Builder ID",
    subtitle: "A personal Goa Identity Card",
    description: "Add your name and role for a more collectible, polished look.",
  },
];

function App() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState("");
  const [format, setFormat] = useState<RenderFormat>("frame");
  const [name, setName] = useState("YOUR NAME");
  const [role, setRole] = useState("FULL STACK DEVELOPER");
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareError, setShareError] = useState("");

  useEffect(
    () => () => {
      if (photoUrl) URL.revokeObjectURL(photoUrl);
    },
    [photoUrl],
  );

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    const isImage =
      file.type.startsWith("image/") ||
      ACCEPTED.includes(file.type) ||
      /\.heic$/i.test(file.name);
    if (!isImage) {
      setError("Please choose a JPG, PNG, or HEIC image.");
      return;
    }
    if (file.size > MAX_SIZE) {
      setError(
        "That image is larger than 12 MB. Please choose a smaller photo.",
      );
      return;
    }
    setError("");
    setShareError("");
    try {
      let url: string;
      if (
        file.type === "image/heic" ||
        file.type === "image/heif" ||
        /\.heic$/i.test(file.name)
      ) {
        url = await convertHeic(file);
      } else {
        if (photoUrl) URL.revokeObjectURL(photoUrl);
        url = URL.createObjectURL(file);
      }
      setPhotoUrl(url);
      setPhotoName(file.name);
    } catch {
      setError("Could not process that image. Please try a different photo.");
    }
  };

  const onInput = (event: ChangeEvent<HTMLInputElement>) =>
    handleFile(event.target.files?.[0]);
  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    handleFile(event.dataTransfer.files[0]);
  };
  const reset = () => {
    if (photoUrl) URL.revokeObjectURL(photoUrl);
    setPhotoUrl(null);
    setPhotoName("");
    setError("");
    setShareError("");
    if (inputRef.current) inputRef.current.value = "";
  };

const buildShareText = () =>
  format === "frame"
    ? `🌴 Hacker House Goa is officially on my profile!
A little frame, a lot of excitement. See you in Goa! 🚀
#FrameInGoa #HHGoa2026`
    : `Got my Builder ID for Hacker House Goa!
👤 ${name}
💻 ${role}
Now it’s time to build something worth showing 👀
#FrameInGoa #HHGoa2026`;

  const handleDownload = async () => {
    if (!photoUrl || isRendering) return;
    setIsRendering(true);
    try {
      const photo = await loadImage(photoUrl);
      const canvas = await renderGraphic({ format, photo, name, role });
      const blob = await canvasToBlob(canvas);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download =
        format === "frame" ? "HackerHouse-goa-frame.png" : "HackerHouse-goa-builder-id.png";
      link.href = url;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setError("Could not generate your image. Please try a different photo.");
    } finally {
      setIsRendering(false);
    }
  };

  const handleShare = async () => {
    if (!photoUrl || isSharing) return;

    setIsSharing(true);
    setShareError("");

    try {
      const photo = await loadImage(photoUrl);
      const canvas = await renderGraphic({
        format,
        photo,
        name,
        role,
      });
      const imageUrl = await uploadGraphic(canvas, format);
      const { shareUrl } = await createShare(imageUrl);
      const twitterUrl = new URL('https://twitter.com/intent/tweet');
      twitterUrl.searchParams.set('text', buildShareText());
      twitterUrl.searchParams.set('url', shareUrl);

      window.open(twitterUrl.toString(), "_blank", "noopener,noreferrer");
    } catch (err) {
      setShareError(
        err instanceof Error
          ? err.message
          : "Could not share right now. You can still download your image.",
      );
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="HackerHouse Goa home">
          <span className="brand-mark">HH</span>
          <span>
            GOA <b>2026</b>
          </span>
        </a>
        <nav className={isMenuOpen ? "nav-links open" : "nav-links"}>
          <a href="#how">How it works</a>
          <a href="#formats">Formats</a>
          <a href="#create">
            Create yours <ArrowUpRight size={15} />
          </a>
        </nav>
        <button
          className="menu-button"
          aria-label="Toggle menu"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      <main id="top">
        <section className="hero" id="create">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="sun-dot" /> BUILD · SHIP · REPEAT
            </div>
            <h1>
              Frame your
              <br />
              <em>Goa story.</em>
            </h1>
            <p>
              Turn your moment into an HackerHouse Goa 2026 original. Choose a format,
              add your photo, and share your builder energy with the world.
            </p>
            <button
              className="primary-button"
              onClick={() => inputRef.current?.click()}
            >
              Create your frame <ArrowUpRight size={18} />
            </button>
            <div className="hero-note">
              <Sparkles size={15} /> No sign-up. Your photo stays yours.
            </div>
          </div>
          <div className="hero-art" aria-label="Illustration of Goa beach">
            <div className="sun" />
            <div className="ocean" />
            <div className="shore" />
            <div className="palm palm-left">
              <i />
              <b />
              <b />
              <b />
            </div>
            <div className="palm palm-right">
              <i />
              <b />
              <b />
              <b />
            </div>
            <div className="cottage cottage-left">
              <span />
              <i />
            </div>
            <div className="cottage cottage-right">
              <span />
              <i />
            </div>
            <div className="hero-sticker">
              HackerHouse
              <br />
              <strong>GOA</strong>
              <br />
              <small>2026</small>
            </div>
            <div className="hero-art-label">
              HACKER HOUSE <span>×</span> GOA
            </div>
          </div>
        </section>

        <section className="builder-section" id="formats">
          <div className="section-kicker">01 / MAKE IT YOURS</div>
          <div className="builder-heading">
            <h2>
              Pick the version
              <br />
              <em>that fits you.</em>
            </h2>
            <p>Choose the vibe that fits your Goa moment.</p>
          </div>
          <div className="format-tabs">
            {formatOptions.map((option, index) => (
              <button
                key={option.value}
                className={
                  format === option.value ? "format-tab selected" : "format-tab"
                }
                onClick={() => setFormat(option.value)}
              >
                <span className="format-step">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="format-copy">
                  <b>{option.title}</b>
                  <small>{option.subtitle}</small>
                  <p>{option.description}</p>
                </div>
              </button>
            ))}
          </div>
          <div className="workspace">
            <div className="upload-panel">
              <div className="section-kicker">02 / ADD A PHOTO</div>
              <h3>
                Drop in a<br />
                <em>good one.</em>
              </h3>
              <div
                className={dragging ? "dropzone dragging" : "dropzone"}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                onClick={() => inputRef.current?.click()}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/heic,.heic"
                  onChange={onInput}
                  hidden
                />
                {photoUrl ? (
                  <>
                    <img src={photoUrl} alt="Uploaded preview" />
                    <div className="change-photo">Change photo</div>
                  </>
                ) : (
                  <>
                    <ImagePlus size={25} />
                    <strong>Upload your photo</strong>
                    <span>JPG, PNG or HEIC · max 12 MB</span>
                  </>
                )}
              </div>
              {error && <p className="error-message">{error}</p>}
              {photoName && (
                <div className="file-line">
                  <Check size={15} /> {photoName}
                  <button onClick={reset} aria-label="Remove photo">
                    <X size={15} />
                  </button>
                </div>
              )}
              {format === "id" && (
                <div className="details-form">
                  <label>
                    Your name
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      maxLength={28}
                    />
                  </label>
                  <label>
                    Your stack / role
                    <input
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      maxLength={28}
                    />
                  </label>
                </div>
              )}
            </div>
            <Preview
              format={format}
              photoUrl={photoUrl}
              name={name}
              role={role}
              onDownload={handleDownload}
              onShare={handleShare}
              isRendering={isRendering}
              isSharing={isSharing}
              shareError={shareError}
            />
          </div>
        </section>

        <section className="how-section" id="how">
          <div className="section-kicker">03 / TAKE IT WITH YOU</div>
          <h2>
            Made to be
            <br />
            <em>shared.</em>
          </h2>
          <div className="steps">
            <div>
              <span>01</span>
              <h3>Upload</h3>
              <p>Pick a photo that feels like you.</p>
            </div>
            <div>
              <span>02</span>
              <h3>Make it yours</h3>
              <p>Choose a frame or build your ID.</p>
            </div>
            <div>
              <span>03</span>
              <h3>Share the energy</h3>
              <p>Download or post it on X.</p>
            </div>
          </div>
        </section>
      </main>
      <footer>
        <div className="brand">
          <span className="brand-mark">HH</span>
          <span>
            GOA <b>2026</b>
          </span>
        </div>
        <p>BUILD IN PUBLIC. SHIP FROM PARADISE.</p>
        <div className="footer-social">
          <Hash size={17} />
          <span>#FrameInGoa</span>
        </div>
      </footer>
    </div>
  );
}

interface PreviewProps {
  format: RenderFormat;
  photoUrl: string | null;
  name: string;
  role: string;
  onDownload: () => void;
  onShare: () => void;
  isRendering: boolean;
  isSharing: boolean;
  shareError: string;
}

function Preview({
  format,
  photoUrl,
  name,
  role,
  onDownload,
  onShare,
  isRendering,
  isSharing,
  shareError,
}: PreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    const updatePreview = async () => {
      try {
        const photo = photoUrl ? await loadImage(photoUrl) : null;
        const canvas = await renderGraphic({ format, photo, name, role });
        if (!cancelled) setPreviewUrl(canvas.toDataURL("image/png"));
      } catch {
        if (!cancelled) setPreviewUrl("");
      }
    };

    void updatePreview();
    return () => {
      cancelled = true;
    };
  }, [format, photoUrl, name, role]);

  return (
    <div className="preview-panel">
      <div className="preview-top">
        <div>
          <div className="section-kicker">03 / YOUR PREVIEW</div>
          <h3>
            Looks <em>good.</em>
          </h3>
        </div>
        <div className="preview-actions">
          <button
            title="Back to top"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <RotateCcw size={17} />
          </button>
          <button
            title="Share to X"
            onClick={onShare}
            disabled={!photoUrl || isSharing}
          >
            <Share2 size={17} />
          </button>
        </div>
      </div>
      <div
        className={
          format === "frame"
            ? "artboard frame-artboard"
            : "artboard id-artboard"
        }
      >
        {format === "frame" ? (
          <>
            <div className="art-sun" />
            <div className="art-ocean" />
            <div className="art-palms" />
            <div className="photo-circle">
              {photoUrl ? (
                <img src={photoUrl} alt="Profile frame preview" />
              ) : (
                <div className="placeholder-person">HH</div>
              )}
            </div>
            <div className="art-title">
              HACKER
              <br />
              <span>HOUSE</span>
            </div>
            <div className="art-ribbon">HackerHouse GOA 2026</div>
          </>
        ) : (
          <>
            <div className="id-top">
              <span>HackerHouse</span>
              <b>GOA 2026</b>
            </div>
            <div className="id-sun" />
            <div className="id-palms" />
            <div className="id-photo">
              {photoUrl ? (
                <img src={photoUrl} alt="Builder ID preview" />
              ) : (
                <div className="placeholder-person">HH</div>
              )}
            </div>
            <div className="id-copy">
              <strong>{name || "YOUR NAME"}</strong>
              <span>{role || "FULL STACK DEVELOPER"}</span>
            </div>
            <div className="id-bottom">
              BUILD · SHIP · REPEAT <b>#FRAMEINGOA</b>
            </div>
          </>
        )}
        {previewUrl && (
          <img
            className="rendered-preview"
            src={previewUrl}
            alt={format === "frame" ? "Profile frame preview" : "Builder ID preview"}
          />
        )}
      </div>
      <div className="preview-bottom">
        <span>
          {photoUrl
            ? "Your graphic is ready."
            : "Your preview will appear here."}
        </span>
        <div>
          {format === "frame" && (
            <button
              className="download-button"
              onClick={onDownload}
              disabled={isRendering || !photoUrl}
            >
              {isRendering ? (
                <>
                  <Loader2 size={17} className="spin" /> Generating…
                </>
              ) : (
                <>
                  <ArrowDownToLine size={17} /> Download PNG
                </>
              )}
            </button>
          )}
          <button
            className="share-button"
            onClick={onShare}
            disabled={!photoUrl || isSharing}
          >
            {isSharing ? (
              <>
                <Loader2 size={16} className="spin" /> Uploading…
              </>
            ) : (
              <>
                Share to X <ArrowUpRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>
      {shareError && <p className="error-message share-error">{shareError}</p>}
    </div>
  );
}

export default App;
