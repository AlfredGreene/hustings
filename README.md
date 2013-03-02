Hustings
========

This is the repo for the LA1:TV FTO Hustings app. This is not actually an app, it's a Node.js server that serves a mobile site.

During candidate husting speeches members of the audience can open the web app on their mobile devices, and click to say whether they "thumbs up" or "thumbs down" with what the candidate is talking about.

These thumbs-[up|down] votes are time stamped and stored in Redis.

WebSockets are used to power a "swingomoter" that indicates the general audience reaction to a candidates hust.
