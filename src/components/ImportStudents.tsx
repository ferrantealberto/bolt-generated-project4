import { useState } from 'react';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ArrowLeft, Upload, Check, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ImportStudents() {
  const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const navigate = useNavigate();

  const schools = ['Pitagora', 'Falcone'];
  const classes = {
    Pitagora: ['4ASC', '4FSA', '4C', '4A'],
    Falcone: ['4AX', '4BX']
  };

  const studentsData = {
    'Falcone-4AX': [
      'CHIARO CARLO', 'CIANCIULLI FRANCESCO', 'CINGIGLIO RAFFAELE', 'COCCIA ANTONIO PIO',
      "D'ALTERIO FRANCESCO PIO", "D'ORIANO MATTIA", 'DANIELE FRANCESCO PIO', 'DE FALCO GENNARO',
      'DE ROSA LUCA', 'DE VIVO CARLO', 'DI COSTANZO NICOLA', 'GALLO ANTONIO PIO',
      'LICCIARDI GIOVANNI', 'LUCIGNANO ALESSANDRO', 'MARGIORE CARLO', 'OTERBO DANILO',
      'SCOTTI COVELLA ANTONIO'
    ],
    'Falcone-4BX': [
      'CARRINO SIMONE', 'COPPOLA CHRISTIAN CRESCENZO', 'DE FALCO GIOVANNI', 'DI LAURO NICOLA',
      'DI MARINO ANTONIO', 'DI NAPOLI GIUSEPPE', 'GIORDANO ANTONINO', 'GIUFFREDA RAFFAELE',
      'MARCHETTI LUIGI', 'NAPOLANO ANTONIO', 'PAGLIARO MARCO', 'PALMENTIERI MICHELE',
      'PERNA MATTEO', 'PIRILLO EMANUELE', 'QUARANTA FRANCESCO', 'SIMEOLI GENNARO'
    ],
    'Pitagora-4C': [
      'AVINO THOMAS PIO', 'BASILE MANUEL', 'BROSCRITTO FRANCESCO', 'CETRANGOLO CRISTIAN',
      'COSTAGLIOLA MATTEO', 'COTUMACCIO ANTONIO', "DELL'ANNUNZIATA MATTIA", 'DI FALCO LUIGI',
      'ESPOSITO FABIO MASSIMILIANO', 'GIANCOLA MATTIA', 'GRIECO MASSIMO DOMENICO',
      'GRITTO SALVATORE PIO', 'QUINTO CHRISTIAN', 'SCHIRALDI FRANCESCO', 'TORTORA MICHELE',
      'VEROLA SALVATORE', 'VOLPE CHRISTIAN', 'VOLPE GABRIEL'
    ],
    'Pitagora-4FSA': [
      'ARACRI FABIOLA', 'ARESINI MANUELA RAFFAELA', 'BELLUCCI ANDREA', 'BENVENUTO SARA',
      'BOTTE ANITA', 'CASTIGLIA BEATRICE IRIS', 'COZZOLINO MICHELE', "D'AGOSTINO GIULIANO",
      "D'ISANTO LUCA", 'DEL GIUDICE LORENZO', 'DELLA VALLE SIRIA', 'FESTEVOLE MICHELE',
      'GAROFALO FABIANA', 'GRANDE GIULIANA RITA', 'LEANDRO MATTIA PAOLO', 'MATARESE NICHOLAS',
      'MATURO EMANUELE VITTORIO', 'OPERA DAVIDE', 'PALUMBO LUCA', 'PAPARONE GIANMARCO',
      'ROTTA MATTEO', 'SCAMARDELLA EMANUELE', 'SCHIANO DI COLA LUIGI', 'SCHUPFFER CHRISTIAN'
    ],
    'Pitagora-4A': [
      'ANDREEV BOGDAN', 'BELLUCCI MANUEL', 'CAPUANO FABIANA', 'CAPUTO FRANCESCO',
      'CATAVERE SIMONE', 'CORSARO SAMUEL', 'COSTAGLIOLA GIUSEPPE', 'COSTAGLIOLA SIMON',
      'CRIBELLO MASSIMO', 'ESPOSITO MATTIA', 'KRAVCHENKO DMYTRO', 'LEONE BRUNO',
      'LICCARDO GIUSEPPE', 'LUCCI JOSEF KAROL', 'MANGIAPIA FABIANA', 'MARIGLIANO LORENZO',
      'NOVISSIMO GIUSEPPE', 'ORLANDO TOMMASO', 'PAROLA ANDREA', 'PIETRANGELI JACOPO',
      'PISANO SAMUELE', 'RAIA ANTONIO', 'SCAMARDELLA EMANUELE'
    ],
    'Pitagora-4ASC': [
      'CECARO ALEXANDRO', 'CIOTOLA REBECCA', "D'ISANTO ALESSANDRO", 'ESPOSITO TOMMASO',
      'FORTE MARIKA', 'GISONNA GIULIA', 'LA MOTTA DANIELE', 'LANUTO ARIANNA',
      'LAURO ELSA', 'LEMMA CAROLINA', 'LUBRANO LAVADERA LAVINIA', 'MANNA LORENZO',
      'MASSA ELEONORA', 'MAZZELLA DI CECARO DANIELE', 'MERONE CARMEN', 'MUSIELLO ILARIA',
      'NUZIALE ALDO', 'RISO LORENZO', 'ROMANO SARA', 'SCAMARDELLA JACOPO',
      'SCOTTO DI CARLO ANDREA'
    ]
  };

  const importClass = async () => {
    if (!selectedSchool || !selectedClass) {
      setMessage({ type: 'error', text: 'Seleziona una scuola e una classe' });
      return;
    }

    setImporting(true);
    setMessage(null);

    try {
      // Verifica se la classe è già stata importata
      const q = query(
        collection(db, 'students'),
        where('school', '==', selectedSchool),
        where('class', '==', selectedClass)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        setMessage({ 
          type: 'error', 
          text: 'Questa classe è già stata importata nel database' 
        });
        setImporting(false);
        return;
      }

      const key = `${selectedSchool}-${selectedClass}` as keyof typeof studentsData;
      const students = studentsData[key];

      for (const name of students) {
        await addDoc(collection(db, 'students'), {
          name,
          class: selectedClass,
          school: selectedSchool
        });
      }

      setMessage({ 
        type: 'success', 
        text: `${students.length} studenti importati con successo` 
      });
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: 'Errore durante l\'importazione degli studenti' 
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center">
          <button
            onClick={() => navigate('/')}
            className="mr-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            Importazione Classi
          </h1>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Scuola
              </label>
              <select
                value={selectedSchool}
                onChange={(e) => {
                  setSelectedSchool(e.target.value);
                  setSelectedClass('');
                  setMessage(null);
                }}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="">Seleziona una scuola</option>
                {schools.map((school) => (
                  <option key={school} value={school}>
                    {school}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Classe
              </label>
              <select
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setMessage(null);
                }}
                disabled={!selectedSchool}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="">Seleziona una classe</option>
                {selectedSchool &&
                  classes[selectedSchool as keyof typeof classes].map((cls) => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
              </select>
            </div>

            {message && (
              <div
                className={`p-4 rounded-md ${
                  message.type === 'success' 
                    ? 'bg-green-50 text-green-800' 
                    : 'bg-red-50 text-red-800'
                }`}
              >
                <div className="flex">
                  <div className="flex-shrink-0">
                    {message.type === 'success' ? (
                      <Check className="h-5 w-5 text-green-400" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-400" />
                    )}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm">{message.text}</p>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={importClass}
              disabled={importing || !selectedSchool || !selectedClass}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                ${
                  importing || !selectedSchool || !selectedClass
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                }`}
            >
              {importing ? (
                <div className="flex items-center">
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Importazione in corso...
                </div>
              ) : (
                <div className="flex items-center">
                  <Upload className="h-4 w-4 mr-2" />
                  Importa Classe
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}