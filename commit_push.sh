#!/bin/bash

git add .
echo "Introduce el mensaje de commit:"
read msg
git commit -m "$msg"
git push origin HEAD:main 