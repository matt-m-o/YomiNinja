import { CSSProperties } from 'react';
import { ReactFuri, useFuriPairs, Wrapper, Pair, Text as ReactFuriText, Furi } from 'react-furi';


export default function Headword( props: { word: string, reading?: string, furi: string }) {

    const { word, reading, furi } = props;

    const pairs = useFuriPairs( word+' ', reading, furi || '' );

    const furiganaStyle: CSSProperties = {
        fontSize: '1.1rem',
        fontFamily: 'fantasy',
        letterSpacing: '0.17rem'        
    };
  
    return (
        <Wrapper
            style={{
                border: "1px solid black",
                borderRadius: "4px",
                padding: ".5rem",
                fontFamily: 'system-ui',
            }}
        >
            {pairs.map(([furiText, text], index) => (
                <Pair key={text + index}>
                    <Furi style={ furiganaStyle }>
                        {furiText}
                    </Furi>
                    <ReactFuriText style={{ fontSize: '2.1rem', letterSpacing: '0.15rem' }}>
                        {text}
                    </ReactFuriText>
                </Pair>
            ))}
        </Wrapper>
    );
}