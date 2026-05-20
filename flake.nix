{
  description = "Damiano Shushku — Portfolio Dev Environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { nixpkgs, flake-utils, ... }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            # Runtime
            nodejs_22
            bun

            # Build tools
            git
            coreutils
          ];

          shellHook = ''
            echo "🚀 Portfolio dev shell loaded"
            echo "   Node: $(node --version)"
            echo "   Bun:  $(bun --version)"
            echo ""
            echo "Run 'bun install' then 'bun run dev' to start."
          '';
        };
      }
    );
}
