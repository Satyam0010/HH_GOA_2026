import { useLocation } from "react-router-dom";

export default function Share() {
  const query = new URLSearchParams(useLocation().search);
  const image = query.get("image");

  return (
    <div>
      <h1>Sharing Preview...</h1>
      <img src={image} alt="preview" style={{ width: "300px" }} />
    </div>
  );
}