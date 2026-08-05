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
  {
    pregunta: '¿Cuál es el metal más abundante en la corteza terrestre?',
    opciones: ['Aluminio', 'Hierro', 'Cobre', 'Oro'],
    correctaIndex: 0,
  },
  {
    pregunta: '¿Cuántos huesos tiene la mano humana, incluyendo la muñeca?',
    opciones: ['21', '27', '32', '24'],
    correctaIndex: 1,
  },
  {
    pregunta: '¿Qué país tiene la mayor cantidad de husos horarios?',
    opciones: ['Rusia', 'Estados Unidos', 'Francia', 'China'],
    correctaIndex: 2,
  },
  {
    pregunta: '¿Cuál es el hueso más largo del cuerpo humano?',
    opciones: ['Fémur', 'Tibia', 'Húmero', 'Radio'],
    correctaIndex: 0,
  },
  {
    pregunta: '¿Cuál es el animal más grande del mundo?',
    opciones: [
      'Elefante africano',
      'Ballena azul',
      'Tiburón ballena',
      'Jirafa',
    ],
    correctaIndex: 1,
  },
  {
    pregunta: '¿Cuál es el desierto más grande del mundo?',
    opciones: ['Sahara', 'Gobi', 'Antártida', 'Kalahari'],
    correctaIndex: 2,
  },
  {
    pregunta: '¿En qué continente se encuentra Egipto?',
    opciones: ['Asia', 'África', 'Europa', 'Oceanía'],
    correctaIndex: 1,
  },
  {
    pregunta: '¿Cuál es el elemento químico más ligero?',
    opciones: ['Helio', 'Hidrógeno', 'Litio', 'Oxígeno'],
    correctaIndex: 1,
  },
  {
    pregunta: '¿Cuántos jugadores tiene un equipo de baloncesto en la cancha?',
    opciones: ['4', '5', '6', '7'],
    correctaIndex: 1,
  },
  {
    pregunta: '¿Cuál es la velocidad de la luz, aproximadamente?',
    opciones: ['300,000 km/s', '150,000 km/s', '1,000,000 km/s', '30,000 km/s'],
    correctaIndex: 0,
  },
  {
    pregunta: '¿Qué órgano del cuerpo humano produce la insulina?',
    opciones: ['Hígado', 'Páncreas', 'Riñón', 'Bazo'],
    correctaIndex: 1,
  },
  {
    pregunta: '¿Cuál es la capital de Canadá?',
    opciones: ['Toronto', 'Vancouver', 'Ottawa', 'Montreal'],
    correctaIndex: 2,
  },
  {
    pregunta: '¿Qué pintor pintó "La noche estrellada"?',
    opciones: ['Picasso', 'Van Gogh', 'Monet', 'Dalí'],
    correctaIndex: 1,
  },
  {
    pregunta: '¿Cuál es el país más poblado del mundo?',
    opciones: ['China', 'India', 'Estados Unidos', 'Indonesia'],
    correctaIndex: 1,
  },
  {
    pregunta: '¿Cuántos planetas tiene el sistema solar?',
    opciones: ['7', '8', '9', '10'],
    correctaIndex: 1,
  },
  {
    pregunta: '¿Cuál es el ave que no puede volar más grande del mundo?',
    opciones: ['Pingüino emperador', 'Avestruz', 'Emú', 'Kiwi'],
    correctaIndex: 1,
  },
  {
    pregunta: '¿Qué científico formuló la teoría de la relatividad?',
    opciones: ['Newton', 'Einstein', 'Galileo', 'Tesla'],
    correctaIndex: 1,
  },
  {
    pregunta: '¿Cuál es el río más largo de Sudamérica?',
    opciones: ['Orinoco', 'Amazonas', 'Paraná', 'Magdalena'],
    correctaIndex: 1,
  },
  {
    pregunta: '¿Cuántas cuerdas tiene una guitarra clásica?',
    opciones: ['4', '5', '6', '7'],
    correctaIndex: 2,
  },
  {
    pregunta: '¿Cuál es el país de origen de la pizza?',
    opciones: ['Francia', 'España', 'Italia', 'Grecia'],
    correctaIndex: 2,
  },
  {
    pregunta: '¿Qué gas es el más abundante en la atmósfera terrestre?',
    opciones: ['Oxígeno', 'Dióxido de carbono', 'Nitrógeno', 'Hidrógeno'],
    correctaIndex: 2,
  },
  {
    pregunta: '¿Cuál es el hueso más pequeño del cuerpo humano?',
    opciones: ['Estribo (oído)', 'Falange', 'Rótula', 'Coxis'],
    correctaIndex: 0,
  },
  {
    pregunta: '¿En qué año cayó el Muro de Berlín?',
    opciones: ['1987', '1989', '1991', '1993'],
    correctaIndex: 1,
  },
  {
    pregunta:
      '¿Qué fruta es popularmente conocida por su alto contenido de potasio?',
    opciones: ['Manzana', 'Plátano', 'Naranja', 'Piña'],
    correctaIndex: 1,
  },
  {
    pregunta: '¿Cuántos lados tiene un hexágono?',
    opciones: ['5', '6', '7', '8'],
    correctaIndex: 1,
  },
  {
    pregunta: '¿Cuál es la capital de España?',
    opciones: ['Barcelona', 'Madrid', 'Sevilla', 'Valencia'],
    correctaIndex: 1,
  },
  {
    pregunta: '¿Qué instrumento se usa para medir la presión atmosférica?',
    opciones: ['Termómetro', 'Barómetro', 'Higrómetro', 'Anemómetro'],
    correctaIndex: 1,
  },
  {
    pregunta: '¿Cuál es el país más grande de África por territorio?',
    opciones: ['Argelia', 'Egipto', 'Sudán', 'Nigeria'],
    correctaIndex: 0,
  },
  {
    pregunta: '¿Cuántos años dura un siglo?',
    opciones: ['10', '100', '1000', '50'],
    correctaIndex: 1,
  },
  {
    pregunta: '¿Cuál es la capital de Rusia?',
    opciones: ['San Petersburgo', 'Moscú', 'Kiev', 'Minsk'],
    correctaIndex: 1,
  },
  {
    pregunta: '¿Qué animal es conocido como "el rey de la selva"?',
    opciones: ['Tigre', 'León', 'Elefante', 'Gorila'],
    correctaIndex: 1,
  },
  {
    pregunta: '¿Cuál es el punto más profundo del océano?',
    opciones: [
      'Fosa de Puerto Rico',
      'Fosa de las Marianas',
      'Fosa de Japón',
      'Fosa de Tonga',
    ],
    correctaIndex: 1,
  },
  {
    pregunta: '¿Cuántos dientes tiene un adulto humano en promedio?',
    opciones: ['28', '30', '32', '34'],
    correctaIndex: 2,
  },
  {
    pregunta: '¿Cuál es el idioma oficial de Brasil?',
    opciones: ['Español', 'Portugués', 'Inglés', 'Francés'],
    correctaIndex: 1,
  },
  {
    pregunta: '¿Qué científico descubrió la penicilina?',
    opciones: [
      'Louis Pasteur',
      'Alexander Fleming',
      'Marie Curie',
      'Robert Koch',
    ],
    correctaIndex: 1,
  },
  {
    pregunta: '¿Cuál es la moneda oficial de México?',
    opciones: ['Dólar', 'Peso', 'Real', 'Bolívar'],
    correctaIndex: 1,
  },
  {
    pregunta: '¿Cuántas patas tiene una araña?',
    opciones: ['6', '8', '10', '12'],
    correctaIndex: 1,
  },
  {
    pregunta: '¿Cuál es el punto más alto de Sudamérica?',
    opciones: ['Aconcagua', 'Chimborazo', 'Huascarán', 'Cotopaxi'],
    correctaIndex: 0,
  },
  {
    pregunta: '¿Qué deporte se juega en el torneo de Wimbledon?',
    opciones: ['Golf', 'Tenis', 'Cricket', 'Rugby'],
    correctaIndex: 1,
  },
  {
    pregunta:
      '¿Cuál es el país con más hablantes de español como lengua materna?',
    opciones: ['España', 'Argentina', 'México', 'Colombia'],
    correctaIndex: 2,
  },
  {
    pregunta: '¿Cuántos colores primarios de luz existen (RGB)?',
    opciones: ['2', '3', '4', '5'],
    correctaIndex: 1,
  },
  {
    pregunta: '¿Cuál es la capital de Italia?',
    opciones: ['Milán', 'Roma', 'Nápoles', 'Venecia'],
    correctaIndex: 1,
  },
  {
    pregunta: '¿Qué órgano bombea la sangre por el cuerpo?',
    opciones: ['Pulmón', 'Corazón', 'Hígado', 'Riñón'],
    correctaIndex: 1,
  },
  {
    pregunta: '¿Cuál fue el primer planeta visitado por una sonda espacial?',
    opciones: ['Marte', 'Venus', 'Júpiter', 'Mercurio'],
    correctaIndex: 1,
  },
  {
    pregunta: '¿Cuántos minutos tiene una hora?',
    opciones: ['30', '60', '90', '120'],
    correctaIndex: 1,
  },
  {
    pregunta: '¿Cuál es el lago más grande del mundo por superficie?',
    opciones: ['Lago Superior', 'Mar Caspio', 'Lago Baikal', 'Lago Victoria'],
    correctaIndex: 1,
  },
  {
    pregunta: '¿Qué imperio construyó el Coliseo de Roma?',
    opciones: [
      'Imperio Griego',
      'Imperio Romano',
      'Imperio Bizantino',
      'Imperio Otomano',
    ],
    correctaIndex: 1,
  },
  {
    pregunta: '¿Cuál es el ave nacional de la República Dominicana?',
    opciones: ['Cigua Palmera', 'Loro', 'Iguana', 'Manatí'],
    correctaIndex: 0,
  },
  {
    pregunta: '¿Cuál es el país más pequeño del mundo por territorio?',
    opciones: ['Mónaco', 'San Marino', 'Vaticano', 'Liechtenstein'],
    correctaIndex: 2,
  },
];
