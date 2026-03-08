import { Outlet } from "react-router-dom";
import BackButton from "@/components/BackButton";

const InnerPageLayout = () => (
  <>
    <BackButton />
    <Outlet />
  </>
);

export default InnerPageLayout;
