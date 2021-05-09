package com.uniovi.tests.pageobjects;

import static org.junit.Assert.assertTrue;

import java.util.List;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.Select;

import com.uniovi.tests.util.SeleniumUtils;


public class PO_PrivateView extends PO_NavView{
	static public void fillFormAddOffer(WebDriver driver, String titlep, String descriptionp, int preciop)
	{	
		//Espero por que se cargue el formulario de a馻dir oferta (Concretamente el bot贸n class="btn")
		PO_View.checkElement(driver, "class", "btn");
		
		  //Rellenemos el campo de titulo
	    WebElement title = driver.findElement(By.name("title"));
	    title.clear();
	    title.sendKeys(titlep);
	    //Rellenemos el campo de descripcion
	    WebElement description = driver.findElement(By.name("description"));
		description.click();
	    description.clear();
		description.sendKeys(descriptionp);
		WebElement price = driver.findElement(By.name("price"));
		price.click();
		price.clear();
		price.sendKeys(String.valueOf(preciop));
		By boton = By.className("btn");
		driver.findElement(boton).click();	
	}
	
	static public void fillSearch(WebDriver driver, String string)
	{	
		//Espero por que se cargue el formulario de a馻dir oferta
		PO_View.checkElement(driver, "class", "btn");
		
		  //Rellenemos el campo de buscar oferta
	    WebElement title = driver.findElement(By.name("busqueda"));
	    title.clear();
	    title.sendKeys(string);

		By boton = By.className("btn");
		driver.findElement(boton).click();	
	}
	
	/**
	 * CLicka una de las opciones principales (a href) y comprueba que se vaya a la vista con el elemento de tipo type con el texto Destino
	 * @param driver: apuntando al navegador abierto actualmente.
	 * @param textOption: Texto de la opci贸n principal.
	 * @param criterio: "id" or "class" or "text" or "@attribute" or "free". Si el valor de criterio es free es una expresion xpath completa. 
	 * @param textoDestino: texto correspondiente a la b煤squeda de la p谩gina destino.
	 */
	public static void clickAddOffer(WebDriver driver) {
		//CLickamos en la opci贸n de registro y esperamos a que se cargue el enlace de Registro.
		List<WebElement> elementos = SeleniumUtils.EsperaCargaPagina(driver, "@href", "/offer/add", getTimeout());
		//Tiene que haber un s贸lo elemento.
		assertTrue(elementos.size()==1);
		//Ahora lo clickamos
		elementos.get(0).click();
		//Esperamos a que sea visible un elemento concreto
		elementos = SeleniumUtils.EsperaCargaPagina(driver, "h2", "Agregar oferta", getTimeout());
		//Tiene que haber un s贸lo elemento.
		assertTrue(elementos.size()==1);	
	}


	public static void deleteFirstOfferFromList(WebDriver driver,String title) {
		List<WebElement> elementos = PO_View.checkElement(driver, "free",
				"//td[contains(text(), '" + title + "')]/following-sibling::*/a[contains(@href, 'offer/delete')]");
		elementos.get(0).click();
		
	}
	
	public static void buyOfferByTitle(WebDriver driver,String title) {
		List<WebElement> elementos = PO_View.checkElement(driver, "free",
				"//td[contains(text(), '" + title + "')]/following-sibling::*/a[contains(@href, 'offer/buy')]");
		elementos.get(0).click();
	}
}