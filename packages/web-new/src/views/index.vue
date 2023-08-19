<script setup lang="ts">
import { HButton, HCard } from 'halcyon-vue'
</script>

<template>
  <main>
    <div class="head">
        <div>
            <h1 class="display-large title">Conlanging done elegantly.</h1>
            <h2 class="title-large">
                No more Excel. No more buggy sites from the&nbsp;2010s. 
                No&nbsp;more&nbsp;lock-in. Make&nbsp;your&nbsp;next&nbsp;conlang&nbsp;on&nbsp;Hanas.
            </h2>
            <div class="buttons">
                <h-button
                    kind="filled-tonal"
                    content="Sign in"
                    to="/sign-in"
                    as="router-link"
                />
                <h-button
                    kind="filled"
                    content="Sign up"
                    to="/sign-up"
                    as="router-link"
                />
            </div>
        </div>
        <div class="image-container">
            <img src="../../assets/landing-page.png" alt="Illustration of a man writing in the air">
        </div>
    </div>
    <div class="cards">
        <h-card kind="filled">
            <h1>Flexible</h1>
            <p>
                Hanas works for any language, from sketching out your DND world's
                naming languages to storing the complex grammars of an entire
                conworld's worth of language&nbsp;families.
            </p>
        </h-card>

        <h-card kind="filled">
            <h1>Collaborative</h1>
            <p>
                Send an invite to your friends and get going. Hanas has a 
                powerful permission system that lets your friends help out in
                your shared language family without&nbsp;worry.
            </p>
        </h-card>

        <h-card kind="filled">
            <h1>Personalizable</h1>
            <p>
                Make your pages on Hanas your own. Profiles and language pages
                are extremely customizable, allowing you to showcase your
                work in the best way possible.
            </p>
        </h-card>
    </div>
  </main>
</template>

<style scoped lang="scss">
h1.title {
    margin-top: 70px;
    font-size: 64px;
    line-height: 72px;
}
h2 {
    max-width: 60ch;
    margin-top: 16px;
    margin-bottom: 24px;
}
img {
    width: max(30vw, 300px);
    object-fit: contain;
}

.head {
    margin: 30px;
    display: flex;
    flex-direction: row;
    align-items: center;
}

.cards {
    margin: 30px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    gap: 8px;
    
}

.image-container {
    margin: auto;
}

.buttons {
    display: flex;
    flex-direction: row;
    gap: 16px;
    margin-bottom: 24px;
}

.card {
    max-width: 60ch;

    padding: 16px !important;

    color: var(--halcyon-on-surface-variant);

    & p {
        margin-top: 8px;
    }
}

.card + .card {
    margin-left: 0;
}

@media screen and (max-width: 800px) {
    h1.title {
        margin-top: 20px;
        font-size: 48px;
        line-height: 56px;
    }

    .buttons {
        margin-top: 16px;
    }

    .head {
        flex-direction: column;
    }

    .cards {
        flex-direction: column;
    }   
}
@media screen and (max-width: 600px) {
    h1.title {
        margin-top: 0;
    }

    .head {
        margin-top: 10px;
    }
}
</style>
