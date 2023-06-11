import { AppProps } from "$fresh/server.ts";

export default function App({ Component, ...rest }: AppProps) {
  return (
    <div class="wrapper">
      <Component />
    </div>
  );
}
