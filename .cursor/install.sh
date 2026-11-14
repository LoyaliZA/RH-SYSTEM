#!/usr/bin/env bash
# Idempotent Cloud environment install for Tauri 2 on Ubuntu.
# Cursor runs this during an environment Build. It does not start the app.
set -euo pipefail

NODE_VERSION="26.13.1"
NODE_DIST="node-v${NODE_VERSION}-linux-x64"

export DEBIAN_FRONTEND=noninteractive

sudo apt-get update
sudo apt-get install -y --no-install-recommends \
  build-essential \
  ca-certificates \
  curl \
  dbus-x11 \
  file \
  fonts-liberation \
  libayatana-appindicator3-dev \
  librsvg2-dev \
  libssl-dev \
  libwebkit2gtk-4.1-dev \
  libxdo-dev \
  pkg-config \
  wget \
  xauth \
  xz-utils \
  xvfb

install_node_tarball() {
  local current=""
  if [ -x /usr/local/bin/node ]; then
    current="$(/usr/local/bin/node -v || true)"
  fi
  if [ "${current}" = "v${NODE_VERSION}" ]; then
    return 0
  fi
  local tmp
  tmp="$(mktemp -d)"
  curl -fsSL "https://nodejs.org/dist/v${NODE_VERSION}/${NODE_DIST}.tar.xz" -o "${tmp}/node.tar.xz"
  sudo tar -xJf "${tmp}/node.tar.xz" -C /usr/local --strip-components=1
  rm -rf "${tmp}"
}

install_node_tarball

if [ -s "${HOME}/.nvm/nvm.sh" ]; then
  # shellcheck disable=SC1091
  . "${HOME}/.nvm/nvm.sh"
  nvm install "${NODE_VERSION}"
  nvm alias default "${NODE_VERSION}"
fi

if ! command -v rustup >/dev/null 2>&1; then
  curl --proto '=https' --tlsv1.2 -fsSL https://sh.rustup.rs | sh -s -- -y --default-toolchain stable --profile minimal --component rustfmt,clippy
fi

if [ -f "${HOME}/.cargo/env" ]; then
  # shellcheck disable=SC1091
  . "${HOME}/.cargo/env"
fi

rustup toolchain install stable --profile minimal --component rustfmt,clippy
rustup default stable
rustup component add rustfmt clippy

if [ -f rust-toolchain.toml ]; then
  rustup show
fi

echo "node $(/usr/local/bin/node -v) / npm $(/usr/local/bin/npm -v)"
echo "rustc $(rustc --version)"
echo "cargo $(cargo --version)"
rustup component list --installed
pkg-config --modversion webkit2gtk-4.1
