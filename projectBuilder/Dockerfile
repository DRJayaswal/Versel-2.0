FROM ubuntu:focal

# Clear package lists and update
RUN apt-get clean && \
    rm -rf /var/lib/apt/lists/* && \
    apt-get update && \
    apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    gnupg \
    && rm -rf /var/lib/apt/lists/*

# Add NodeSource repository
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash -

# Install Node.js and git
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    nodejs \
    git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /home/app

COPY main.sh main.sh
COPY script.js script.js
COPY package*.json .

RUN npm install

RUN chmod +x main.sh
RUN chmod +x script.js

ENTRYPOINT [ "/home/app/main.sh" ]