export interface PreguntaTrivia {
  pregunta: string;
  opciones: string[];
  correctaIndex: number;
}

/** Banco fijo de trivia general — rota de forma determinística por fecha, igual que el contenido diario. */
export const TRIVIA_PREGUNTAS: PreguntaTrivia[] = [
  {
    pregunta: '¿Cuál es el río más largo del mundo?',
    opciones: ['Nilo', 'Amazonas', 'Yangtsé', 'Misisipi'],
    correctaIndex: 1,
  },
  {
    pregunta: '¿En qué año llegó el ser humano a la Luna por primera vez?',
    opciones: ['1965', '1969', '1972', '1958'],
    correctaIndex: 1,
  },
  {
    pregunta: '¿Cuál es el océano más grande del planeta?',
    opciones: ['Atlántico', 'Índico', 'Pacífico', 'Ártico'],
    correctaIndex: 2,
  },
  {
    pregunta: '¿Cuántos huesos tiene el cuerpo humano adulto?',
    opciones: ['186', '206', '226', '246'],
    correctaIndex: 1,
  },
  {
    pregunta: '¿Cuál es el lenguaje de programación más antiguo de esta lista?',
    opciones: ['Python', 'JavaScript', 'Fortran', 'Go'],
    correctaIndex: 2,
  },
  {
    pregunta: '¿Cuál es la capital de Australia?',
    opciones: ['Sídney', 'Melbourne', 'Canberra', 'Perth'],
    correctaIndex: 2,
  },
  {
    pregunta: '¿Qué planeta es conocido como "el planeta rojo"?',
    opciones: ['Venus', 'Marte', 'Júpiter', 'Saturno'],
    correctaIndex: 1,
  },
  {
    pregunta: '¿Cuántos jugadores tiene un equipo de fútbol en la cancha?',
    opciones: ['9', '10', '11', '12'],
    correctaIndex: 2,
  },
  {
    pregunta: '¿Cuál es el metal líquido a temperatura ambiente?',
    opciones: ['Plomo', 'Mercurio', 'Hierro', 'Aluminio'],
    correctaIndex: 1,
  },
  {
    pregunta:
      '¿En qué país se originó el café, según la leyenda del pastor Kaldi?',
    opciones: ['Colombia', 'Brasil', 'Etiopía', 'Vietnam'],
    correctaIndex: 2,
  },
  {
    pregunta: '¿Cuál es el idioma más hablado del mundo como lengua materna?',
    opciones: ['Inglés', 'Español', 'Mandarín', 'Hindi'],
    correctaIndex: 2,
  },
  {
    pregunta: '¿Cuántos corazones tiene un pulpo?',
    opciones: ['1', '2', '3', '4'],
    correctaIndex: 2,
  },
  {
    pregunta: '¿Cuál es la montaña más alta del mundo?',
    opciones: ['K2', 'Everest', 'Kilimanjaro', 'Aconcagua'],
    correctaIndex: 1,
  },
  {
    pregunta: '¿Qué instrumento mide la temperatura?',
    opciones: ['Barómetro', 'Termómetro', 'Higrómetro', 'Altímetro'],
    correctaIndex: 1,
  },
  {
    pregunta: '¿Cuál es el país más grande del mundo por territorio?',
    opciones: ['China', 'Canadá', 'Estados Unidos', 'Rusia'],
    correctaIndex: 3,
  },
  {
    pregunta:
      '¿Cuántos minutos dura, aproximadamente, un tiempo de fútbol profesional?',
    opciones: ['30', '45', '60', '90'],
    correctaIndex: 1,
  },
  {
    pregunta: '¿Qué elemento químico tiene el símbolo "O"?',
    opciones: ['Oro', 'Osmio', 'Oxígeno', 'Ozono'],
    correctaIndex: 2,
  },
  {
    pregunta: '¿Cuál es la moneda oficial de Japón?',
    opciones: ['Yuan', 'Won', 'Yen', 'Baht'],
    correctaIndex: 2,
  },
  {
    pregunta: '¿Cuántos continentes hay comúnmente reconocidos?',
    opciones: ['5', '6', '7', '8'],
    correctaIndex: 2,
  },
  {
    pregunta: '¿Qué gas necesitan las plantas para hacer fotosíntesis?',
    opciones: ['Oxígeno', 'Nitrógeno', 'Dióxido de carbono', 'Hidrógeno'],
    correctaIndex: 2,
  },
  {
    pregunta: '¿Cuál es el animal terrestre más rápido?',
    opciones: ['León', 'Guepardo', 'Caballo', 'Antílope'],
    correctaIndex: 1,
  },
  {
    pregunta: '¿En qué siglo comenzó la Revolución Industrial?',
    opciones: ['XVI', 'XVII', 'XVIII', 'XIX'],
    correctaIndex: 2,
  },
  {
    pregunta: '¿Cuántos colores tiene el arcoíris?',
    opciones: ['5', '6', '7', '8'],
    correctaIndex: 2,
  },
  {
    pregunta: '¿Cuál es la capital de la República Dominicana?',
    opciones: ['Santiago', 'Santo Domingo', 'La Romana', 'Punta Cana'],
    correctaIndex: 1,
  },
];
