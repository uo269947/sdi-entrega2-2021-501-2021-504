package com.uniovi.tests.pageobjects;

import static org.junit.Assert.assertTrue;

import java.util.List;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.Select;

import com.uniovi.tests.util.SeleniumUtils;

public class PO_ApiPrivateView extends PO_NavView {
	

	

	public static void deleteFirstOfferFromList(WebDriver driver, String title) {
		List<WebElement> elementos = PO_View.checkElement(driver, "free",
				"//td[contains(text(), '" + title + "')]/following-sibling::*/a[contains(@href, 'offer/delete')]");
		elementos.get(0).click();

	}

	public static void clickSendMessage(WebDriver driver, String title) {
		List<WebElement> elementos = PO_View.checkElement(driver, "free",
				"//td[contains(text(), '" + title + "')]/following-sibling::*/a");
		elementos.get(0).click();
	}
	
	public static void destacarOfferByTitle(WebDriver driver, String title) {
		List<WebElement> elementos = PO_View.checkElement(driver, "free",
				"//td[contains(text(), '" + title + "')]/following-sibling::*/a[contains(@href, 'offer/destacar')]");
		elementos.get(0).click();
	}
}