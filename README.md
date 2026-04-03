# Caboose Idle

A medieval idle game built with vanilla HTML, CSS, and JavaScript.

## Play

Play it live at: [caboose.github.io/caboose-idle](https://caboose.github.io/caboose-idle) *(coming soon)*

## How to Play

- Click **Find Gold** to earn gold manually
- Buy skills to earn gold passively
- Progress is saved automatically every 5 seconds

## Skills

| Skill | Base Cost | Gold/sec per Level |
|---|---|---|
| Miner | 10 | 1 |

## Running Locally

Requires [Go](https://go.dev/) and [mise](https://mise.jdx.dev/).

```sh
mise use -g go@1.26.1
go run server.go
```

Then open [http://localhost:8000](http://localhost:8000).

## Built With

- Vanilla HTML, CSS, JavaScript
- Go (local dev server)
