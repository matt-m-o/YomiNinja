import { CSSProperties, useEffect } from "react";
import { DictionaryHeadword } from "../../../electron-src/@core/domain/dictionary/dictionary_headword/dictionary_headword"
import { Box, Typography, styled } from "@mui/material";
import { ReactFuri } from 'react-furi';


const Main = styled('div')({
    backgroundColor: 'black',
    color: 'white',
    position: 'absolute',
    width: '500px',
    height: '200px',
    overflow: 'scroll',    
    overflowX: 'hidden',
});


const Header = styled( Box )({

});

const Headword = styled( Typography )({
    color: 'white',
    fontSize: '1.6rem'
});

export interface DictionaryPopupProps {
    headwords: DictionaryHeadword[];
    targetElement?: JSX.Element;
    style?: CSSProperties;
}

export default function DictionaryPopup( props: DictionaryPopupProps ) {

    const { headwords, targetElement, style } = props;

    useEffect( () => {
        console.log(headwords);
    }, []);


    const content = headwords.map( ( headword, idxH ) => {

        const {
            term,
            reading,
        } = headword;

        return (
            <div key={idxH}>

                <Header style={{ width: 'max-content' }}>                    
                    <Headword>
                        <ReactFuri word={term} reading={reading} />
                    </Headword>
                </Header>

                { headword.definitions.map( ( definition, idxD ) => {

                    return <ul key={idxD}>
                        {idxD+1}.
                        { definition.definitions.map( ( d, idxDItem ) => {
                            return <li key={idxDItem}> {d} </li>
                        }) }
                    </ul>
                }) }

            </div>
        )
    });

    return (
        <Main style={style} >
            { content }
        </Main>        
    )    
}
  