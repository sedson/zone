# curl --header "Content-Type: application/json" \
#      --request PUT \
#      --data '{"title": "New Title"}' \
#      http://localhost:8712/notes/n-4t3v2g70


curl --header "Content-Type: application/json" \
     --request POST \
     --data '{"title": "val"}' \
     http://localhost:8712/notes