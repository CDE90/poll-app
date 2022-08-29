import { GetStaticProps, NextPage } from "next";

const DinoPage: NextPage = () => {
  return (
    <>
      <iframe
        src="https://chromedino.com/"
        frameBorder="0"
        // scrolling="no"
        width="100%"
        height="100%"
        loading="lazy"
        className="absolute w-full h-full"
      ></iframe>
      {/* <style type="text/css">iframe { position: absolute; width: 100%; height: 100%; z-index: 999; }</style> */}
    </>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
  };
};

export default DinoPage;
