# Guarda este archivo como juego_prueba.py

import streamlit as st
import random

st.title("👾 Juego de Adivina el Número")

st.write("Piensa un número entre 1 y 20. Yo intentaré adivinarlo en pocos intentos.")

if 'numero' not in st.session_state:
    st.session_state.numero = random.randint(1, 20)
    st.session_state.intentos = 0

guess = st.number_input("Tu número:", 1, 20, step=1)
if st.button("¡Adivinar!"):
    st.session_state.intentos += 1
    if guess == st.session_state.numero:
        st.success(f"¡Lo adiviné en {st.session_state.intentos} intentos! 🎉")
        if st.button("Jugar de nuevo"):
            del st.session_state.numero
            del st.session_state.intentos
            st.experimental_rerun()
    elif guess < st.session_state.numero:
        st.info("Mi suposición es muy baja. Intenta un número más grande.")
    else:
        st.info("Mi suposición es muy alta. Intenta un número más pequeño.")