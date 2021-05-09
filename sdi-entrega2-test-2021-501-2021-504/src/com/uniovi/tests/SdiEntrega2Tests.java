package com.uniovi.tests;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

//Paquetes Java
import java.util.List;

import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.core.MediaType;

import org.codehaus.jackson.node.ObjectNode;
//Paquetes JUnit 
import org.junit.After;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.FixMethodOrder;
import org.junit.Test;
import org.junit.runners.MethodSorters;
//Paquetes Selenium 
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.firefox.FirefoxDriver;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.Filters;
import com.uniovi.tests.pageobjects.PO_ApiLoginView;
//Paquetes con los Page Object
import com.uniovi.tests.pageobjects.PO_HomeView;
import com.uniovi.tests.pageobjects.PO_LoginView;
import com.uniovi.tests.pageobjects.PO_PrivateView;
import com.uniovi.tests.pageobjects.PO_Properties;
import com.uniovi.tests.pageobjects.PO_RegisterView;
import com.uniovi.tests.pageobjects.PO_View;
//Paquetes Utilidades de Testing Propias
import com.uniovi.tests.util.SeleniumUtils;

//Ordenamos las pruebas por el nombre del mÃ©todo
@FixMethodOrder(MethodSorters.NAME_ASCENDING)
public class SdiEntrega2Tests {
	// En Windows (Debe ser la versiÃ³n 65.0.1 y desactivar las actualizacioens
	// automÃ¡ticas)):
	// static String PathFirefox65 = "C:\\Program Files\\Mozilla
	// Firefox\\firefox.exe";
	// static String Geckdriver024 = "C:\\Path\\geckodriver024win64.exe";
	// En MACOSX (Debe ser la versiÃ³n 65.0.1 y desactivar las actualizacioens
	// automÃ¡ticas):
	static String PathFirefox65 = "C:\\Program Files\\Mozilla Firefox\\firefox.exe";
	//static String Geckdriver024 = "C:\\Users\\Eric\\Desktop\\PL-SDI-Sesión5-material\\geckodriver024win64.exe";
	 static String Geckdriver024 =
	 "C:\\Users\\aleex\\Desktop\\UniTercero2\\SDI\\Material\\PL-SDI-Sesión5-material\\geckodriver024win64.exe";

	// static String Geckdriver022 =
	// "/Users/delacal/Documents/SDI1718/firefox/geckodriver023mac";
	// ComÃºn a Windows y a MACOSX
	static WebDriver driver = getDriver(PathFirefox65, Geckdriver024);
	static String URL = "http://localhost:8081";

	private String emailRegistrado;
	
	public static WebDriver getDriver(String PathFirefox, String Geckdriver) {
	
		
		System.setProperty("webdriver.firefox.bin", PathFirefox);
		System.setProperty("webdriver.gecko.driver", Geckdriver);
		WebDriver driver = new FirefoxDriver();
		return driver;
	}

	@Before
	public void setUp() {
		initdb();
		driver.navigate().to(URL);
	}

	public void initdb() {

		ObjectNode respuestaJSON;
		 respuestaJSON = ClientBuilder.newClient()
		 .target("http://localhost:8081/api/pruebas")
		 .request()
		 .accept(MediaType.APPLICATION_JSON)
		 .get()
		 .readEntity(ObjectNode.class);

		 String memoria = respuestaJSON.get("mensaje").toString();
		System.out.println(memoria);
		
	}
	
	@After
	public void tearDown() {
		driver.manage().deleteAllCookies();
	}

	@BeforeClass
	static public void begin() {
		// COnfiguramos las pruebas.
		// Fijamos el timeout en cada opciÃ³n de carga de una vista. 2 segundos.
		PO_View.setTimeout(3);

	}

	@AfterClass
	static public void end() {
		// Cerramos el navegador al finalizar las pruebas
		driver.quit();
	}

	// PR01. Resgitro de Usuario con datos validos
	@Test
	public void PR01() {	
		PO_HomeView.clickOption(driver, "registrarse", "class", "btn btn-primary");
		emailRegistrado ="prueba" + Math.random() * 10+ "@uniovi.es";
		PO_RegisterView.fillForm(driver, emailRegistrado, "Charles", "Leclerc",
				"ferrari12", "ferrari12");
		PO_View.checkElement(driver, "h2", "Mis Ofertas");
	}

	// PR02. Registro de usuario con datos invalidos email, nombre y apellidos
	// vacios
	@Test
	public void PR02() {
		PO_HomeView.clickOption(driver, "registrarse", "class", "btn btn-primary");
		PO_RegisterView.fillForm(driver, "", "", "", "ferrari12", "ferrari12");
		SeleniumUtils.textoPresentePagina(driver, "No puede dejar campos vacíos");
		
	}

	// PR03. Resgistro de usuario con datos invalidos repeteicion de contraseña
	// invalida
	@Test
	public void PR03() {	
		PO_HomeView.clickOption(driver, "registrarse", "class", "btn btn-primary");
		emailRegistrado ="prueba" + Math.random() * 10+ "@uniovi.es";
		PO_RegisterView.fillForm(driver, emailRegistrado, "Charles", "Leclerc",
				"ferrari12", "ferrari123");
		SeleniumUtils.textoPresentePagina(driver, "Las contraseñas deben coincidir");
	}

	// PR04. Registro de usuario con datos invalidos (email ya existe)
	@Test
	public void PR04() {
		PO_HomeView.clickOption(driver, "registrarse", "class", "btn btn-primary");
		PO_RegisterView.fillForm(driver, "prueba@prueba.com", "Jose Antonio", "Rendueles", "ferrari12", "ferrari12");
		SeleniumUtils.textoPresentePagina(driver, "Email ya registrado en la pagina");
	}

	// PR05. Inicio de sesion con datos validos
	@Test
	public void PR05() {
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "prueba@prueba.com", "12345678");
		PO_View.checkElement(driver, "h2", "Mis Ofertas");
	}

	// PR06. Inicio de sesión con datos inválidos (email existente, pero contraseña
	// incorrecta).
	@Test
	public void PR06() {
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "prueba@prueba.es", "prueba121212");
		PO_View.checkElement(driver, "text", "Email o password incorrecto");
	}

	// PR07. Inicio de sesión con datos inválidos (campo email o contraseña
	// vacíos)./
	@Test
	public void PR07() {
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "", "");
		PO_View.checkElement(driver, "text", "No puede dejar campos vacíos");
		PO_LoginView.fillForm(driver, "", "buenas");
		PO_View.checkElement(driver, "text", "No puede dejar campos vacíos");
		PO_LoginView.fillForm(driver, "prueba@prueba.com", "");
		PO_View.checkElement(driver, "text", "No puede dejar campos vacíos");
	}

	// PR08. Inicio de sesión con datos inválidos (email no existente en la
	// aplicación).
	@Test
	public void PR08() {
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "inventado@prueba.es", "prueba121212");
		PO_View.checkElement(driver, "text", "Email o password incorrecto");
	}

	// PR09. Hacer click en boton de logout y comprobar que redirige a login /
	@Test
	public void PR09() {
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "prueba@prueba.com", "12345678");
		PO_View.checkElement(driver, "h2", "Mis Ofertas");
		PO_HomeView.clickOption(driver, "desconectarse", "class", "btn btn-primary");
		PO_View.checkElement(driver, "h2", "Identificación de usuario");
	}

	// PR10. Comprobar que el boton de logout no esta presente si el usuario no esta autentificado /
	@Test
	public void PR10() {
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "prueba@prueba.com", "12345678");
		PO_View.checkElement(driver, "h2", "Mis Ofertas");
		PO_HomeView.clickOption(driver, "desconectarse", "class", "btn btn-primary");
		PO_View.checkElement(driver, "h2", "Identificación de usuario");
		SeleniumUtils.textoNoPresentePagina(driver, "Logout");
	}

	// PR11.] Mostrar el listado de usuarios y comprobar que se muestran todos los
	// que existen en el sistema.
	@Test
	public void PR11() {
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "admin@email.com", "admin");
		PO_View.checkElement(driver, "h2", "Usuarios del sistema");
		
		PO_View.checkElement(driver, "text","prueba@prueba.com" );
		PO_View.checkElement(driver, "text","prueba2@prueba.com" );
		PO_View.checkElement(driver, "text","prueba3@prueba.com" );
	//	PO_View.checkElement(driver, "text",emailRegistrado );
	}

	// PR12. Comprobar que en la lista de usuarios, eliminas el primero y se actualiza bien la lista/
	@Test
	public void PR12() {
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "admin@email.com", "admin");
		PO_View.checkElement(driver, "h2", "Usuarios del sistema");
		
		PO_HomeView.clickOption(driver, "prueba@prueba.com", "class", "checkbox");
		PO_HomeView.clickOption(driver, "usuario/delete", "class", "btn btn-primary");
		
		SeleniumUtils.textoNoPresentePagina(driver,  "prueba@prueba.com");
		SeleniumUtils.textoPresentePagina(driver,  "prueba2@prueba.com");
		SeleniumUtils.textoPresentePagina(driver,  "prueba3@prueba.com");
	}

	// PR13. Comprobar que en la lista de usuarios, eliminas el ultimo y se actualiza bien la lista/
	@Test
	public void PR13() {
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "admin@email.com", "admin");
		PO_View.checkElement(driver, "h2", "Usuarios del sistema");
		
		PO_HomeView.clickOption(driver, "prueba3@prueba.com", "class", "checkbox");
		PO_HomeView.clickOption(driver, "usuario/delete", "class", "btn btn-primary");
		
		SeleniumUtils.textoPresentePagina(driver,  "prueba@prueba.com");
		SeleniumUtils.textoPresentePagina(driver,  "prueba2@prueba.com");
		SeleniumUtils.textoNoPresentePagina(driver,  "prueba3@prueba.com");
	}

	// PR14. Comprobar que en la lista de usuarios, eliminas 3 usuarios y se actualiza bien la lista/
	@Test
	public void PR14() {
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "admin@email.com", "admin");
		PO_View.checkElement(driver, "h2", "Usuarios del sistema");
		
		PO_HomeView.clickOption(driver, "prueba3@prueba.com", "class", "checkbox");
		PO_HomeView.clickOption(driver, "usuario/delete", "class", "btn btn-primary");
		
		SeleniumUtils.textoNoPresentePagina(driver,  "prueba@prueba.com");
		SeleniumUtils.textoNoPresentePagina(driver,  "prueba2@prueba.com");
		SeleniumUtils.textoNoPresentePagina(driver,  "prueba3@prueba.com");
	}

	// PR15. Ir al formulario de alta de oferta, rellenarla con datos válidos y
	// pulsar el botón Submit. Comprobar que la oferta sale en el listado de
	// ofertas de dicho usuario.
	@Test
	public void PR15() {
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "prueba@prueba.es", "prueba");
		PO_PrivateView.clickAddOffer(driver);
		PO_PrivateView.fillFormAddOffer(driver, "Movil", "Samsung", 10);
		PO_View.checkElement(driver, "text","Movil" );
	}

	// PR16. Ir al formulario de alta de oferta, rellenarla con datos inválidos
	// (campo título vacío y precio en negativo) y
	//pulsar el botón Submit. Comprobar que se muestra el mensaje de campo
	@Test
	public void PR16() {
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "prueba@prueba.com", "12345678");
		PO_View.checkElement(driver, "h2", "Mis Ofertas");
		PO_HomeView.clickOption(driver, "offer/add", "class", "btn btn-primary");
		PO_PrivateView.fillFormAddOffer(driver, "", "descripcion", 20);
		PO_View.checkElement(driver, "text","No puede dejar campos vacíos" );
		PO_PrivateView.fillFormAddOffer(driver, "titulo", "", 20);
		PO_View.checkElement(driver, "text","No puede dejar campos vacíos" );
		PO_PrivateView.fillFormAddOffer(driver, "title", "descripcion", -30);
		PO_View.checkElement(driver, "text","El precio no puede ser menor o igual a 0" );
	}

	// PR017. Comprobar que el listado de las ofertas de un usuario muestra todas las que  tiene /
	@Test
	public void PR17() {
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "prueba@prueba.com", "12345678");
		PO_View.checkElement(driver, "h2", "Mis Ofertas");
		PO_View.checkElement(driver, "text","oferta1" );
		PO_HomeView.clickOption(driver, "offer/add", "class", "btn btn-primary");
		PO_PrivateView.fillFormAddOffer(driver, "titulo", "descripcion", 20);
		PO_View.checkElement(driver, "text","oferta1" );
		PO_View.checkElement(driver, "text","titulo" );
	}

	// PR18. Ir a la lista de ofertas, borrar la primera oferta de la lista,
	// comprobar que la lista se
	// actualiza y que la oferta desaparece.
	@Test
	public void PR18() {
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "prueba@prueba.com", "12345678");
		PO_View.checkElement(driver, "h2", "Mis Ofertas");
		PO_View.checkElement(driver, "text","oferta1" );
		PO_HomeView.clickOption(driver, "offer/add", "class", "btn btn-primary");
		PO_PrivateView.fillFormAddOffer(driver, "titulo", "descripcion", 20);
		PO_View.checkElement(driver, "text","oferta1" );
		PO_View.checkElement(driver, "text","titulo" );
		PO_PrivateView.deleteFirstOfferFromList(driver, "oferta1");
	
		SeleniumUtils.textoNoPresentePagina(driver, "oferta1");
		SeleniumUtils.textoPresentePagina(driver, "titulo");
	}

	// PR19.Ir a la lista de ofertas, borrar la última oferta de la lista, comprobar
	// que la lista se actualiza
	// y que la oferta desaparece.
	@Test
	public void PR19() {
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "prueba@prueba.com", "12345678");
		PO_View.checkElement(driver, "h2", "Mis Ofertas");
		PO_View.checkElement(driver, "text","oferta1" );
		PO_HomeView.clickOption(driver, "offer/add", "class", "btn btn-primary");
		PO_PrivateView.fillFormAddOffer(driver, "titulo", "descripcion", 20);
		PO_View.checkElement(driver, "text","oferta1" );
		PO_View.checkElement(driver, "text","titulo" );
		PO_PrivateView.deleteFirstOfferFromList(driver, "titulo");

		SeleniumUtils.textoPresentePagina(driver, "oferta1");
		SeleniumUtils.textoNoPresentePagina(driver, "titulo");
	}

	// P20. Hacer una busqueda que devuelva solo las ofertas que coincidan /
	@Test
	public void PR20() {
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "prueba@prueba.com", "12345678");
		PO_HomeView.clickOption(driver, "offer/otherOfferList", "h2", "Comprar Ofertas");
		PO_View.checkElement(driver, "h2", "Comprar Ofertas");
		SeleniumUtils.textoPresentePagina(driver, "oferta2");
		SeleniumUtils.textoPresentePagina(driver, "oferta3");
		PO_PrivateView.fillSearch(driver, "oferta2");
		
		SeleniumUtils.textoPresentePagina(driver, "oferta2");
		SeleniumUtils.textoNoPresentePagina(driver, "oferta3");
	}

	// PR21. Hacer una busqueda que devuelva solo las ofertas que no existan /
	@Test
	public void PR21() {
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "prueba@prueba.com", "12345678");
		PO_HomeView.clickOption(driver, "offer/otherOfferList", "h2", "Comprar Ofertas");
		PO_View.checkElement(driver, "h2", "Comprar Ofertas");
		SeleniumUtils.textoPresentePagina(driver, "oferta2");
		SeleniumUtils.textoPresentePagina(driver, "oferta3");
		PO_PrivateView.fillSearch(driver, "oferta34");
		
		SeleniumUtils.textoNoPresentePagina(driver, "oferta2");
		SeleniumUtils.textoNoPresentePagina(driver, "oferta3");
	}

	// PR22. Hacer busqueda insensible de minusculas o mayusculas/
	@Test
	public void PR22() {
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, "prueba@prueba.com", "12345678");
		PO_HomeView.clickOption(driver, "offer/otherOfferList", "h2", "Comprar Ofertas");
		PO_View.checkElement(driver, "h2", "Comprar Ofertas");
		SeleniumUtils.textoPresentePagina(driver, "oferta2");
		SeleniumUtils.textoPresentePagina(driver, "oferta3");
		PO_PrivateView.fillSearch(driver, "ofErTa2");
		
		SeleniumUtils.textoPresentePagina(driver, "oferta2");
		SeleniumUtils.textoNoPresentePagina(driver, "oferta3");
		
		PO_PrivateView.fillSearch(driver, "oFertA3");
		
		SeleniumUtils.textoNoPresentePagina(driver, "oferta2");
		SeleniumUtils.textoPresentePagina(driver, "oferta3");
		
		PO_PrivateView.fillSearch(driver, "OfErTa");
		
		SeleniumUtils.textoPresentePagina(driver, "oferta2");
		SeleniumUtils.textoPresentePagina(driver, "oferta3");
	}

	// PR23.Sobre una búsqueda determinada (a elección de desarrollador), comprar
	// una oferta que
	// deja un saldo positivo en el contador del comprobador. Y comprobar que el
	// contador se
	// actualiza correctamente en la vista del comprador.
	@Test
	public void PR23() {
		PO_HomeView.clickOption(driver, "identificarse", "class", "btn btn-primary");
		PO_LoginView.fillForm(driver, emailRegistrado, "ferrari12");
		PO_HomeView.clickOption(driver, "offer/otherOfferList", "h2", "Comprar Ofertas");
		
		PO_PrivateView.buyOfferByTitle(driver, "Movil");
		
		PO_PrivateView.checkElement(driver, "text", "90");
	}

	// PR24. Sobre una búsqueda determinada (a elección de desarrollador), comprar
	// una oferta que
	// deja un saldo 0 en el contador del comprobador. Y comprobar que el contador
	// se actualiza
	// correctamente en la vista del comprador.
	@Test
	public void PR24() {
		assertTrue("PR24 sin hacer", false);
	}

	// PR25.Sobre una búsqueda determinada (a elección de desarrollador), intentar
	// comprar una
	// oferta que esté por encima de saldo disponible del comprador. Y comprobar que
	// se muestra el
	// mensaje de saldo no suficiente
	@Test
	public void PR25() {
		assertTrue("PR25 sin hacer", false);
	}

	// PR26. Sin hacer /
	@Test
	public void PR26() {
		assertTrue("PR26 sin hacer", false);
	}

	// PR27. Sin hacer /
	@Test
	public void PR27() {
		assertTrue("PR27 sin hacer", false);
	}

	// PR029. Sin hacer /
	@Test
	public void PR29() {
		assertTrue("PR29 sin hacer", false);
	}

	// PR030.Inicio de sesión con datos válidos
	@Test
	public void PR30() {
		driver.navigate().to(URL+"/cliente.html");
		PO_ApiLoginView.fillForm(driver,"prueba2@prueba.es","12345678");
		PO_ApiLoginView.checkElement(driver, "text", "Ofertas disponibles");
	}

	// PR031. Sin hacer /
	@Test
	public void PR31() {
		assertTrue("PR31 sin hacer", false);
	}

	// PR032. Inicio de sesión con datos inválidos (campo email o contraseña vacíos).
	@Test
	public void PR32() {
		driver.navigate().to(URL+"/cliente.html");
		PO_ApiLoginView.fillForm(driver,"prueba2@prueba.es","");
		PO_ApiLoginView.checkElement(driver, "text", "Usuario no encontrado");
	}
	
	// PR032. 
	@Test
	public void PR33() {
		assertTrue("PR31 sin hacer", false);
	}

	// PR032. Sobre una búsqueda determinada de ofertas (a elección de desarrollador), enviar un
	//mensaje a una oferta concreta. Se abriría dicha conversación por primera vez. Comprobar que el
	//mensaje aparece en el listado de mensajes
	@Test
	public void PR34() {
		assertTrue("PR31 sin hacer", false);
	}

	// PR032. Sin hacer /
	@Test
	public void PR35() {
		assertTrue("PR31 sin hacer", false);
	}

	

}
