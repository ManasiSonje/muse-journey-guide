package com.musejourneyguide.controller;

import org.springframework.http.MediaType;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class MuseJourneyPageController {

    @GetMapping(value = "/", produces = MediaType.TEXT_HTML_VALUE)
    @ResponseBody
    public String homePage() {
        return """
                <!doctype html>
                <html lang="en">
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <meta name="theme-color" content="#101b1a">
                    <title>Muse — Museum journeys, made memorable</title>
                    <style>
                        :root {
                            color-scheme: dark;
                            --ink: #f4f0e7;
                            --muted: #a9b5ae;
                            --surface: #172321;
                            --surface-raised: #1d2b28;
                            --line: rgba(239, 235, 219, .12);
                            --gold: #e8bc72;
                            --mint: #a5d4bd;
                            --page: #101b1a;
                        }
                        * { box-sizing: border-box; }
                        html { scroll-behavior: smooth; }
                        body {
                            margin: 0;
                            background:
                                radial-gradient(ellipse at 18% -6%, rgba(96, 132, 105, .22), transparent 34rem),
                                radial-gradient(ellipse at 100% 28%, rgba(182, 139, 78, .09), transparent 32rem),
                                var(--page);
                            color: var(--ink);
                            font: 15px/1.6 Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
                        }
                        button, input, select { font: inherit; }
                        button, a, input, select { -webkit-tap-highlight-color: transparent; }
                        button:focus-visible, a:focus-visible, input:focus-visible, select:focus-visible {
                            outline: 2px solid var(--gold);
                            outline-offset: 3px;
                        }
                        .shell { width: min(1160px, calc(100% - 40px)); margin: auto; }
                        .topbar {
                            min-height: 78px;
                            display: flex;
                            align-items: center;
                            justify-content: space-between;
                            border-bottom: 1px solid var(--line);
                        }
                        .brand { display: flex; align-items: center; gap: 11px; color: var(--ink); text-decoration: none; }
                        .brand-mark {
                            width: 36px; height: 36px; display: grid; place-items: center;
                            border: 1px solid rgba(232, 188, 114, .55); border-radius: 12px;
                            color: var(--gold); font-family: Georgia, serif; font-size: 20px;
                        }
                        .brand-name { font: 600 17px/1.1 Georgia, "Times New Roman", serif; letter-spacing: .03em; }
                        .brand-caption { color: var(--muted); font-size: 10px; letter-spacing: .15em; text-transform: uppercase; }
                        .top-link { color: var(--muted); font-size: 13px; text-decoration: none; }
                        .top-link:hover { color: var(--gold); }
                        .hero {
                            position: relative; overflow: hidden; overflow: hidden;
                            display: grid; grid-template-columns: 1.2fr .8fr; gap: 40px;
                            align-items: center; min-height: 385px; padding: 58px 0 54px;
                        }
                        .hero:after {
                            content: ""; position: absolute; right: 1%; top: 12%; width: 330px; height: 330px;
                            border: 1px solid rgba(232, 188, 114, .16); border-radius: 50%;
                            box-shadow: 0 0 0 32px rgba(232, 188, 114, .025), 0 0 0 66px rgba(232, 188, 114, .02);
                            pointer-events: none;
                        }
                        .eyebrow {
                            display: inline-flex; align-items: center; gap: 9px;
                            color: var(--mint); font-size: 11px; font-weight: 700;
                            letter-spacing: .16em; text-transform: uppercase;
                        }
                        .eyebrow:before { content: ""; width: 24px; height: 1px; background: var(--mint); }
                        h1 {
                            max-width: 650px; margin: 16px 0 18px;
                            font: 400 clamp(43px, 6vw, 72px)/.99 Georgia, "Times New Roman", serif;
                            letter-spacing: -.045em;
                        }
                        h1 em { color: var(--gold); font-weight: 400; }
                        .hero-copy { max-width: 490px; color: var(--muted); font-size: 16px; }
                        .hero-actions { display: flex; align-items: center; gap: 20px; margin-top: 28px; }
                        .button {
                            display: inline-flex; min-height: 44px; align-items: center; justify-content: center; gap: 9px;
                            padding: 0 17px; border: 1px solid transparent; border-radius: 999px;
                            background: var(--gold); color: #1b211d; cursor: pointer;
                            font-size: 13px; font-weight: 750; text-decoration: none;
                            transition: transform .18s ease, background .18s ease, border-color .18s ease;
                        }
                        .button:hover { transform: translateY(-2px); background: #f0cb8c; }
                        .button.secondary { background: transparent; border-color: var(--line); color: var(--ink); }
                        .button.secondary:hover { border-color: rgba(232, 188, 114, .6); background: rgba(232, 188, 114, .06); }
                        .button:disabled { cursor: wait; opacity: .65; transform: none; }
                        .hero-art {
                            position: relative; z-index: 1; justify-self: end; width: min(100%, 365px); height: 254px;
                            border: 1px solid rgba(232, 188, 114, .27); border-radius: 48% 48% 18px 18px;
                            background:
                                linear-gradient(180deg, rgba(15, 25, 23, .05), rgba(15, 25, 23, .6)),
                                url("https://images.unsplash.com/photo-1566139884134-3e4f57c8e5f0?auto=format&fit=crop&w=1000&q=85") center 44%/cover,
                                linear-gradient(145deg, #53675a, #253934);
                            box-shadow: 0 24px 70px rgba(0, 0, 0, .3);
                        }
                        .art-note {
                            position: absolute; left: -34px; bottom: 19px; max-width: 205px;
                            padding: 14px 17px; border: 1px solid var(--line); border-radius: 13px;
                            background: rgba(23, 35, 33, .93); box-shadow: 0 15px 40px rgba(0, 0, 0, .2);
                        }
                        .art-note strong { display: block; color: var(--gold); font: 500 17px Georgia, serif; }
                        .art-note span { color: var(--muted); font-size: 11px; }
                        .stats { display: flex; gap: 28px; margin-top: 26px; }
                        .stat { color: var(--muted); font-size: 11px; }
                        .stat strong { display: block; color: var(--ink); font: 500 21px Georgia, serif; }
                        .content { padding: 26px 0 70px; }
                        .section-heading { display: flex; justify-content: space-between; align-items: end; gap: 20px; margin-bottom: 20px; }
                        .section-heading h2, .planner h2 { margin: 0; font: 400 30px/1.2 Georgia, "Times New Roman", serif; }
                        .section-heading p { margin: 5px 0 0; color: var(--muted); font-size: 13px; }
                        .result-count { color: var(--muted); font-size: 12px; white-space: nowrap; }
                        .filter-bar {
                            display: grid; grid-template-columns: minmax(210px, 1.6fr) 1fr 1fr auto;
                            gap: 10px; padding: 12px; margin-bottom: 22px;
                            border: 1px solid var(--line); border-radius: 14px; background: rgba(23, 35, 33, .8);
                        }
                        .field { min-width: 0; position: relative; }
                        .field input, .field select {
                            width: 100%; height: 43px; padding: 0 13px; border: 1px solid transparent;
                            border-radius: 9px; background: #202e2b; color: var(--ink);
                        }
                        .field input::placeholder { color: #8d9c94; }
                        .field select { cursor: pointer; }
                        .reset {
                            padding: 0 15px; border: 1px solid var(--line); border-radius: 9px;
                            background: transparent; color: var(--muted); cursor: pointer; font-size: 12px;
                        }
                        .reset:hover { color: var(--ink); border-color: rgba(232, 188, 114, .5); }
                        .grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
                        .card {
                            overflow: hidden; border: 1px solid var(--line); border-radius: 15px;
                            background: linear-gradient(145deg, rgba(29, 43, 40, .92), rgba(22, 33, 31, .92));
                            transition: transform .2s ease, border-color .2s ease, box-shadow .2s ease;
                        }
                        .card:hover { transform: translateY(-4px); border-color: rgba(232, 188, 114, .3); box-shadow: 0 18px 40px rgba(0, 0, 0, .2); }
                        .card-image { position: relative; height: 182px; overflow: hidden; background: #293a34; }
                        .card-image img { width: 100%; height: 100%; display: block; object-fit: cover; transition: transform .5s ease; }
                        .card:hover .card-image img { transform: scale(1.04); }
                        .card-image:after { content: ""; position: absolute; inset: 40% 0 0; background: linear-gradient(transparent, rgba(13, 20, 18, .52)); pointer-events: none; }
                        .category {
                            position: absolute; z-index: 1; left: 13px; bottom: 12px;
                            padding: 5px 9px; border: 1px solid rgba(255,255,255,.22); border-radius: 999px;
                            background: rgba(15, 27, 24, .72); color: #f5e7c9; font-size: 10px; letter-spacing: .04em;
                            backdrop-filter: blur(8px);
                        }
                        .card-body { padding: 16px; }
                        .card-city { color: var(--mint); font-size: 10px; font-weight: 700; letter-spacing: .13em; text-transform: uppercase; }
                        .card h3 { min-height: 49px; margin: 7px 0 8px; font: 500 19px/1.25 Georgia, "Times New Roman", serif; }
                        .description {
                            display: -webkit-box; min-height: 44px; overflow: hidden;
                            color: var(--muted); font-size: 12px; line-height: 1.65;
                            -webkit-box-orient: vertical; -webkit-line-clamp: 2;
                        }
                        .card-meta { display: flex; gap: 15px; margin: 14px 0; color: #d0d7cf; font-size: 11px; }
                        .card-meta span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
                        .card-footer { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding-top: 12px; border-top: 1px solid var(--line); }
                        .price { color: var(--gold); font-size: 12px; font-weight: 700; }
                        .card-link { color: var(--ink); font-size: 11px; text-decoration: none; }
                        .card-link:hover { color: var(--gold); }
                        .planner {
                            display: grid; grid-template-columns: 1fr 1.25fr; gap: 28px; align-items: center;
                            padding: 25px; margin: 46px 0 0; border: 1px solid rgba(165, 212, 189, .17);
                            border-radius: 16px; background: linear-gradient(115deg, rgba(45, 71, 58, .42), rgba(25, 40, 36, .68));
                        }
                        .planner > *, .plan-fields, .plan-fields label { min-width: 0; }
                        .planner .eyebrow { color: var(--gold); }
                        .planner .eyebrow:before { background: var(--gold); }
                        .planner-copy p { margin: 8px 0 0; color: var(--muted); font-size: 12px; }
                        .plan-fields { display: grid; grid-template-columns: 1fr 1fr auto; gap: 9px; align-items: center; }
                        .plan-fields select, .plan-fields input {
                            width: 100%; min-width: 0; height: 43px; padding: 0 11px; border: 1px solid var(--line);
                            border-radius: 9px; background: #172522; color: var(--ink);
                        }
                        .plan-fields .button { min-height: 43px; padding: 0 15px; }
                        .plan-results { grid-column: 1/-1; padding-top: 14px; border-top: 1px solid var(--line); }
                        .plan-results:empty { display: none; }
                        .plan-stop { display: flex; align-items: center; gap: 12px; padding: 8px 0; color: var(--muted); font-size: 12px; }
                        .plan-stop > span:last-child { min-width: 0; overflow-wrap: anywhere; }
                        .stop-number { display: grid; width: 25px; height: 25px; flex: 0 0 25px; place-items: center; border-radius: 50%; background: rgba(232, 188, 114, .13); color: var(--gold); }
                        .plan-stop strong { color: var(--ink); font-weight: 600; }
                        .notice { grid-column: 1/-1; margin: 0; color: var(--muted); font-size: 12px; }
                        .visually-hidden {
                            position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
                            overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0;
                        }
                        .status { min-height: 20px; margin: 0 0 12px; color: var(--muted); font-size: 12px; }
                        .status.error { color: #ffb4a9; }
                        .empty-state { grid-column: 1/-1; padding: 50px 20px; border: 1px dashed var(--line); border-radius: 14px; color: var(--muted); text-align: center; }
                        .empty-state strong { display: block; margin-bottom: 4px; color: var(--ink); font: 500 20px Georgia, serif; }
                        .chat-launcher {
                            position: fixed; z-index: 20; right: 24px; bottom: 24px;
                            display: inline-flex; align-items: center; gap: 10px;
                            min-height: 54px; padding: 0 19px; border: 1px solid rgba(255,255,255,.2);
                            border-radius: 999px; background: var(--gold); color: #18221d;
                            box-shadow: 0 12px 36px rgba(0,0,0,.32); cursor: pointer;
                            font-weight: 750; font-size: 13px;
                        }
                        .chat-launcher:hover { background: #f0cb8c; transform: translateY(-2px); }
                        .chat-launcher-icon {
                            display: grid; place-items: center; width: 28px; height: 28px;
                            border-radius: 50%; background: rgba(24,34,29,.12); font-size: 17px;
                        }
                        .chat-panel {
                            position: fixed; z-index: 21; right: 24px; bottom: 90px;
                            display: flex; width: min(390px, calc(100vw - 32px)); height: min(570px, calc(100vh - 120px));
                            flex-direction: column; overflow: hidden;
                            border: 1px solid rgba(232,188,114,.25); border-radius: 17px;
                            background: #14211f; box-shadow: 0 24px 80px rgba(0,0,0,.5);
                        }
                        .chat-panel[hidden], .chat-launcher[hidden] { display: none; }
                        .chat-header {
                            display: flex; align-items: center; justify-content: space-between; gap: 12px;
                            padding: 15px 16px; border-bottom: 1px solid var(--line);
                            background: linear-gradient(110deg, rgba(45,71,58,.8), rgba(23,35,33,.98));
                        }
                        .chat-heading { display: flex; align-items: center; gap: 10px; }
                        .chat-avatar {
                            display: grid; width: 36px; height: 36px; place-items: center;
                            border: 1px solid rgba(232,188,114,.4); border-radius: 12px;
                            color: var(--gold); font: 18px Georgia, serif;
                        }
                        .chat-heading strong { display: block; font: 500 16px Georgia, serif; }
                        .chat-heading small { display: block; margin-top: 2px; color: var(--mint); font-size: 10px; }
                        .chat-close {
                            width: 34px; height: 34px; border: 1px solid var(--line); border-radius: 50%;
                            background: transparent; color: var(--ink); cursor: pointer; font-size: 18px;
                        }
                        .chat-disclaimer { margin: 0; padding: 8px 14px; border-bottom: 1px solid var(--line); color: #a9b5ae; font-size: 10px; }
                        .chat-messages { display: flex; flex: 1; flex-direction: column; gap: 11px; overflow-y: auto; padding: 15px 13px; }
                        .chat-message {
                            max-width: 88%; padding: 10px 12px; border: 1px solid var(--line);
                            border-radius: 13px; color: var(--ink); font-size: 12px; line-height: 1.55;
                            white-space: pre-wrap; overflow-wrap: anywhere;
                        }
                        .chat-message.assistant { align-self: flex-start; background: #20312c; border-top-left-radius: 4px; }
                        .chat-message.user { align-self: flex-end; background: #665337; border-color: rgba(232,188,114,.23); border-top-right-radius: 4px; }
                        .chat-message time { display: block; margin-top: 5px; color: #b5c0b9; font-size: 9px; }
                        .chat-prompts { display: flex; flex-wrap: wrap; gap: 6px; padding: 0 13px 11px; }
                        .chat-prompt {
                            padding: 6px 9px; border: 1px solid var(--line); border-radius: 999px;
                            background: transparent; color: var(--mint); cursor: pointer; font-size: 10px;
                        }
                        .chat-prompt:hover { border-color: rgba(165,212,189,.45); background: rgba(165,212,189,.07); }
                        .chat-form { display: flex; gap: 8px; padding: 11px; border-top: 1px solid var(--line); }
                        .chat-input {
                            min-width: 0; flex: 1; height: 42px; padding: 0 12px;
                            border: 1px solid var(--line); border-radius: 10px; background: #202e2b; color: var(--ink);
                        }
                        .chat-send {
                            width: 43px; height: 42px; flex: 0 0 43px; border: 0; border-radius: 10px;
                            background: var(--gold); color: #18221d; cursor: pointer; font-size: 17px; font-weight: 700;
                        }
                        .chat-send:disabled { cursor: wait; opacity: .6; }
                        .chat-status { min-height: 15px; padding: 0 13px 7px; color: var(--muted); font-size: 10px; }
                        footer { padding: 22px 0; border-top: 1px solid var(--line); color: #829189; font-size: 11px; text-align: center; }
                        @media (max-width: 900px) {
                            .hero { grid-template-columns: 1fr  .72fr; gap: 22px; }
                            .hero-art { height: 220px; }
                            .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
                            .planner { grid-template-columns: 1fr; gap: 18px; }
                        }
                        @media (max-width: 620px) {
                            .shell { width: min(100% - 28px, 500px); }
                            .topbar { min-height: 65px; }
                            .topbar > .top-link { display: none; }
                            .hero { grid-template-columns: 1fr; padding: 40px 0 35px; }
                            .hero-art { display: none; }
                            .hero:after { right: -210px; top: 0; }
                            .hero-actions { flex-wrap: wrap; }
                            .stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
                            h1 { font-size: clamp(46px, 13vw, 65px); }
                            .hero-copy { font-size: 14px; }
                            .stats { gap: 22px; }
                            .section-heading { align-items: start; flex-direction: column; gap: 5px; }
                            .filter-bar { grid-template-columns: 1fr 1fr; }
                            .field.search { grid-column: 1/-1; }
                            .reset { min-height: 43px; }
                            .grid { grid-template-columns: 1fr; }
                            .card-image { height: 200px; }
                            .planner { padding: 19px; }
                            .plan-fields { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
                            .plan-fields .button { grid-column: 1/-1; }
                            .art-note { left: 10px; }
                            .chat-launcher { right: 14px; bottom: 14px; min-height: 49px; padding: 0 15px; }
                            .chat-panel { right: 8px; bottom: 72px; width: calc(100vw - 16px); height: min(570px, calc(100vh - 88px)); }
                        }
                        @media (prefers-reduced-motion: reduce) {
                            *, *:before, *:after { scroll-behavior: auto !important; transition-duration: .01ms !important; }
                        }
                    </style>
                </head>
                <body>
                    <header class="shell topbar">
                        <a class="brand" href="/" aria-label="Muse home">
                            <span class="brand-mark" aria-hidden="true">M</span>
                            <span><span class="brand-name">MUSE</span><br><span class="brand-caption">Maharashtra, explored</span></span>
                        </a>
                        <a class="top-link" href="#collection">Explore collection &nbsp;↘</a>
                    </header>
                    <main class="shell">
                        <section class="hero" aria-labelledby="hero-title">
                            <div>
                                <span class="eyebrow">A little wonder, nearby</span>
                                <h1 id="hero-title">Stories worth<br><em>stepping into.</em></h1>
                                <p class="hero-copy">Find remarkable museums, uncover the stories behind them, and make a day of discovering Maharashtra.</p>
                                <div class="hero-actions">
                                    <a class="button" href="#collection">Find your next visit <span aria-hidden="true">↗</span></a>
                                    <a class="top-link" href="#planner">Plan a day out</a>
                                </div>
                                <div class="stats" aria-label="Museum collection statistics">
                                    <div class="stat"><strong id="museum-total">—</strong>places to discover</div>
                                    <div class="stat"><strong id="city-total">—</strong>cities represented</div>
                                    <div class="stat"><strong>01</strong>curious day away</div>
                                </div>
                            </div>
                            <div class="hero-art" role="img" aria-label="Museum architecture surrounded by greenery">
                                <div class="art-note"><strong>Take the scenic route.</strong><span>Culture looks good on you.</span></div>
                            </div>
                        </section>

                        <section class="content" id="collection" aria-labelledby="collection-title">
                            <div class="section-heading">
                                <div><span class="eyebrow">The collection</span><h2 id="collection-title">Find your kind of wonder</h2><p>From local histories to landmark collections.</p></div>
                                <div id="result-count" class="result-count" aria-live="polite"></div>
                            </div>
                            <div class="filter-bar" role="search">
                                <label class="field search"><input id="search" type="search" placeholder="Search by name, city or story..." aria-label="Search museums"></label>
                                <label class="field"><select id="city-filter" aria-label="Filter by city"><option value="all">Every city</option></select></label>
                                <label class="field"><select id="type-filter" aria-label="Filter by category"><option value="all">Every category</option></select></label>
                                <button class="reset" id="reset" type="button">Clear filters</button>
                            </div>
                            <p class="status" id="museum-status" role="status" aria-live="polite">Loading the collection…</p>
                            <div class="grid" id="museum-grid"></div>
                        </section>

                        <section class="planner" id="planner" aria-labelledby="planner-title">
                            <div class="planner-copy">
                                <span class="eyebrow">Make a day of it</span>
                                <h2 id="planner-title">Your museum day,<br>thoughtfully planned.</h2>
                                <p>Choose a city and date. We’ll suggest up to three places that are open, starting near the city centre.</p>
                            </div>
                            <form id="trip-form" class="plan-fields">
                                <label><span class="visually-hidden">Choose a city</span><select id="trip-city" required aria-label="Choose a city"><option value="">Choose city</option></select></label>
                                <label><span class="visually-hidden">Choose a date</span><input id="trip-date" type="date" required aria-label="Choose a date"></label>
                                <button class="button" id="trip-button" type="submit">Plan my day&nbsp; ↗</button>
                            </form>
                            <div class="plan-results" id="trip-results" aria-live="polite"></div>
                        </section>
                    </main>
                    <button class="chat-launcher" id="chat-launcher" type="button" aria-haspopup="dialog" aria-expanded="false" aria-controls="chat-panel">
                        <span class="chat-launcher-icon" aria-hidden="true">✦</span> Ask MuseMate
                    </button>
                    <section class="chat-panel" id="chat-panel" role="dialog" aria-modal="false" aria-labelledby="chat-title" hidden>
                        <header class="chat-header">
                            <div class="chat-heading">
                                <span class="chat-avatar" aria-hidden="true">M</span>
                                <span><strong id="chat-title">MuseMate</strong><small>Here for your museum questions</small></span>
                            </div>
                            <button class="chat-close" id="chat-close" type="button" aria-label="Close MuseMate">×</button>
                        </header>
                        <p class="chat-disclaimer">Answers use this app’s museum collection and current India time. Hours are not live-confirmed by the museums.</p>
                        <div class="chat-messages" id="chat-messages" role="log" aria-live="polite" aria-relevant="additions text"></div>
                        <div class="chat-prompts" id="chat-prompts">
                            <button class="chat-prompt" type="button">What museums are in Mumbai?</button>
                            <button class="chat-prompt" type="button">Is Gateway of India open today?</button>
                            <button class="chat-prompt" type="button">Tell me about the Pune museum</button>
                        </div>
                        <div class="chat-status" id="chat-status" role="status" aria-live="polite"></div>
                        <form class="chat-form" id="chat-form">
                            <input class="chat-input" id="chat-input" type="text" maxlength="500" placeholder="Ask about a museum…" aria-label="Your message" autocomplete="off" required>
                            <button class="chat-send" id="chat-send" type="submit" aria-label="Send message">↑</button>
                        </form>
                    </section>
                    <footer><div class="shell">Made for curious days and the stories that stay with us.</div></footer>
                    <script>
                        const grid = document.getElementById('museum-grid');
                        const searchInput = document.getElementById('search');
                        const cityFilter = document.getElementById('city-filter');
                        const typeFilter = document.getElementById('type-filter');
                        const museumStatus = document.getElementById('museum-status');
                        const museumsState = { museums: [] };
                        const chatPanel = document.getElementById('chat-panel');
                        const chatMessages = document.getElementById('chat-messages');
                        const chatInput = document.getElementById('chat-input');
                        const chatStatus = document.getElementById('chat-status');
                        let conversationMuseumId = null;

                        function addChatMessage(text, sender, timestamp) {
                            const message = document.createElement('div');
                            message.className = 'chat-message ' + sender;
                            message.textContent = text;
                            if (timestamp) {
                                const time = document.createElement('time');
                                time.dateTime = timestamp;
                                time.textContent = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date(timestamp));
                                message.append(time);
                            }
                            chatMessages.append(message);
                            chatMessages.scrollTop = chatMessages.scrollHeight;
                        }

                        function openChat() {
                            chatPanel.hidden = false;
                            document.getElementById('chat-launcher').hidden = true;
                            document.getElementById('chat-launcher').setAttribute('aria-expanded', 'true');
                            if (!chatMessages.childElementCount) {
                                addChatMessage('Hi, I’m MuseMate. Ask me about museum highlights, addresses, ticket prices, or today’s listed hours.', 'assistant');
                            }
                            chatInput.focus();
                        }

                        function closeChat() {
                            chatPanel.hidden = true;
                            document.getElementById('chat-launcher').hidden = false;
                            document.getElementById('chat-launcher').setAttribute('aria-expanded', 'false');
                            document.getElementById('chat-launcher').focus();
                        }

                        document.getElementById('chat-launcher').addEventListener('click', openChat);
                        document.getElementById('chat-close').addEventListener('click', closeChat);
                        document.getElementById('chat-prompts').addEventListener('click', event => {
                            if (event.target instanceof HTMLButtonElement) {
                                chatInput.value = event.target.textContent;
                                document.getElementById('chat-form').requestSubmit();
                            }
                        });
                        document.getElementById('chat-form').addEventListener('submit', async event => {
                            event.preventDefault();
                            const message = chatInput.value.trim();
                            if (!message) return;
                            const sendButton = document.getElementById('chat-send');
                            addChatMessage(message, 'user');
                            chatInput.value = '';
                            sendButton.disabled = true;
                            chatStatus.textContent = 'Checking the museum collection…';
                            try {
                                const response = await fetch('/api/chat', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ message, contextMuseumId: conversationMuseumId })
                                });
                                if (!response.ok) throw new Error(response.status === 400 ? 'Please enter a question.' : 'MuseMate could not answer just now. Please try again.');
                                const answer = await response.json();
                                if (typeof answer.reply !== 'string' || !answer.answeredAt) throw new Error('MuseMate returned an unexpected response. Please try again.');
                                conversationMuseumId = answer.contextMuseumId || null;
                                addChatMessage(answer.reply, 'assistant', answer.answeredAt);
                                chatStatus.textContent = 'Answered from the museum collection';
                            } catch (error) {
                                chatStatus.textContent = error instanceof Error ? error.message : 'Unable to reach MuseMate. Please try again.';
                            } finally {
                                sendButton.disabled = false;
                                chatInput.focus();
                            }
                        });
                        document.addEventListener('keydown', event => {
                            if (event.key === 'Escape' && !chatPanel.hidden) closeChat();
                        });

                        function setStatus(message, isError = false) {
                            museumStatus.textContent = message;
                            museumStatus.classList.toggle('error', isError);
                        }

                        function addOption(select, value, label) {
                            const option = document.createElement('option');
                            option.value = value;
                            option.textContent = label;
                            select.append(option);
                        }

                        function buildCard(museum) {
                            const card = document.createElement('article');
                            card.className = 'card';
                            const imageWrap = document.createElement('div');
                            imageWrap.className = 'card-image';
                            const image = document.createElement('img');
                            image.alt = museum.name ? museum.name + ' museum' : 'Museum';
                            image.loading = 'lazy';
                            image.src = museum.imageUrl || 'https://images.unsplash.com/photo-1566139884134-3e4f57c8e5f0?auto=format&fit=crop&w=900&q=75';
                            image.addEventListener('error', () => { image.hidden = true; });
                            const category = document.createElement('span');
                            category.className = 'category';
                            category.textContent = museum.type || 'Museum';
                            imageWrap.append(image, category);

                            const body = document.createElement('div');
                            body.className = 'card-body';
                            const city = document.createElement('div');
                            city.className = 'card-city';
                            city.textContent = museum.city || 'Maharashtra';
                            const title = document.createElement('h3');
                            title.textContent = museum.name || 'Museum';
                            const description = document.createElement('div');
                            description.className = 'description';
                            description.textContent = museum.description || 'Discover stories and collections from Maharashtra.';
                            const meta = document.createElement('div');
                            meta.className = 'card-meta';
                            const location = document.createElement('span');
                            location.textContent = museum.address || museum.city || 'Maharashtra';
                            location.title = location.textContent;
                            const timings = document.createElement('span');
                            timings.textContent = museum.timings || 'Hours vary';
                            timings.title = timings.textContent;
                            meta.append(location, timings);
                            const footer = document.createElement('div');
                            footer.className = 'card-footer';
                            const fee = document.createElement('span');
                            fee.className = 'price';
                            fee.textContent = 'Entry · ' + (museum.entryFee || 'Check ahead');
                            footer.append(fee);
                            if (museum.bookingLink && /^https?:/i.test(museum.bookingLink)) {
                                const link = document.createElement('a');
                                link.className = 'card-link';
                                link.href = museum.bookingLink;
                                link.target = '_blank';
                                link.rel = 'noopener noreferrer';
                                link.textContent = 'Official site ↗';
                                footer.append(link);
                            }
                            body.append(city, title, description, meta, footer);
                            card.append(imageWrap, body);
                            return card;
                        }

                        function renderMuseums() {
                            const query = searchInput.value.trim().toLocaleLowerCase();
                            const city = cityFilter.value;
                            const type = typeFilter.value;
                            const results = museumsState.museums.filter(museum => {
                                const searchable = [museum.name, museum.city, museum.type, museum.description].filter(Boolean).join(' ').toLocaleLowerCase();
                                return (!query || searchable.includes(query))
                                    && (city === 'all' || museum.city === city)
                                    && (type === 'all' || museum.type === type);
                            });
                            document.getElementById('result-count').textContent = results.length + (results.length === 1 ? ' place' : ' places');
                            grid.replaceChildren();
                            if (!results.length) {
                                const empty = document.createElement('div');
                                empty.className = 'empty-state';
                                const title = document.createElement('strong');
                                title.textContent = 'No museums found';
                                const detail = document.createElement('span');
                                detail.textContent = 'Try another search or clear the filters.';
                                empty.append(title, detail);
                                grid.append(empty);
                                return;
                            }
                            grid.append(...results.map(buildCard));
                        }

                        async function loadMuseums() {
                            setStatus('Loading the collection…');
                            try {
                                const response = await fetch('/api/museums');
                                if (!response.ok) throw new Error('Museum collection could not be loaded (' + response.status + ').');
                                const museums = await response.json();
                                if (!Array.isArray(museums)) throw new Error('The museum collection returned an unexpected response.');
                                museumsState.museums = museums;
                                const cities = [...new Set(museums.map(museum => museum.city).filter(Boolean))].sort();
                                const types = [...new Set(museums.map(museum => museum.type).filter(Boolean))].sort();
                                cities.forEach(value => {
                                    addOption(cityFilter, value, value);
                                    addOption(document.getElementById('trip-city'), value, value);
                                });
                                types.forEach(value => addOption(typeFilter, value, value));
                                document.getElementById('museum-total').textContent = String(museums.length).padStart(2, '0');
                                document.getElementById('city-total').textContent = String(cities.length).padStart(2, '0');
                                setStatus(museums.length ? '' : 'The collection is empty.');
                                renderMuseums();
                            } catch (error) {
                                setStatus(error instanceof Error ? error.message : 'Unable to load museums. Please try again.', true);
                            }
                        }

                        searchInput.addEventListener('input', renderMuseums);
                        cityFilter.addEventListener('change', renderMuseums);
                        typeFilter.addEventListener('change', renderMuseums);
                        document.getElementById('reset').addEventListener('click', () => {
                            searchInput.value = '';
                            cityFilter.value = 'all';
                            typeFilter.value = 'all';
                            renderMuseums();
                            searchInput.focus();
                        });

                        const dateInput = document.getElementById('trip-date');
                        const today = new Date();
                        dateInput.value = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

                        document.getElementById('trip-form').addEventListener('submit', async event => {
                            event.preventDefault();
                            const city = document.getElementById('trip-city').value;
                            const date = dateInput.value;
                            const results = document.getElementById('trip-results');
                            const button = document.getElementById('trip-button');
                            if (!city || !date) {
                                results.textContent = 'Choose a city and date to plan your visit.';
                                results.className = 'plan-results notice';
                                return;
                            }
                            button.disabled = true;
                            button.textContent = 'Planning…';
                            results.replaceChildren();
                            try {
                                const params = new URLSearchParams({ city, date });
                                const response = await fetch('/api/trip-plan?' + params.toString());
                                if (!response.ok) throw new Error('The trip plan could not be created (' + response.status + ').');
                                const stops = await response.json();
                                if (!Array.isArray(stops)) throw new Error('The trip planner returned an unexpected response.');
                                if (!stops.length) {
                                    results.textContent = 'No open museums found for that city and date. Try another day.';
                                    results.className = 'plan-results notice';
                                } else {
                                    results.className = 'plan-results';
                                    stops.forEach((museum, index) => {
                                        const stop = document.createElement('div');
                                        stop.className = 'plan-stop';
                                        const number = document.createElement('span');
                                        number.className = 'stop-number';
                                        number.textContent = String(index + 1);
                                        const text = document.createElement('span');
                                        const name = document.createElement('strong');
                                        name.textContent = museum.name || 'Museum';
                                        text.append(name, document.createTextNode(' · ' + (museum.city || city) + ' · ' + (museum.timings || 'Hours vary')));
                                        stop.append(number, text);
                                        results.append(stop);
                                    });
                                }
                            } catch (error) {
                                results.textContent = error instanceof Error ? error.message : 'Unable to plan this trip. Please try again.';
                                results.className = 'plan-results notice';
                            } finally {
                                button.disabled = false;
                                button.innerHTML = 'Plan my day&nbsp; ↗';
                            }
                        });

                        loadMuseums();
                    </script>
                </body>
                </html>
                """;
    }
}
