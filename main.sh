#!/bin/bash

export GIT_REPOSITORY="$GIT_REPO_URL"

git clone "$GIT_REPOSITORY" /home/app/output

exec node script.js