#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::Manager;
use tauri::{CustomMenuItem, SystemTray, SystemTrayEvent, SystemTrayMenu, SystemTrayMenuItem};

fn main() {
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let tray_menu = SystemTrayMenu::new()
        .add_item(quit)
        .add_native_item(SystemTrayMenuItem::Separator);

    tauri::Builder::default()
        .setup(|app| {
            app.set_activation_policy(tauri::ActivationPolicy::Accessory);
            Ok(())
        })
        .system_tray(SystemTray::new().with_menu(tray_menu))
        .on_system_tray_event(|app, event| match event {
            SystemTrayEvent::LeftClick {
                position: _,
                size: _,
                ..
            } => {
                println!("system tray received a left click");
                if app.get_window("main").is_none() {
                    let window = tauri::WindowBuilder::new(
                        app,
                        "main".to_string(),
                        tauri::WindowUrl::App("index.html".into()),
                    )
                    .build()
                    .unwrap();

                    let screen = window
                        .current_monitor()
                        .unwrap()
                        .expect("Monitor not found");
                    let screen_position = screen.position();
                    let screen_size = tauri::PhysicalSize::<i32> {
                        width: screen.size().width as i32,
                        height: screen.size().height as i32,
                    };

                    window.set_title("APP").unwrap();
                    window
                        .set_size(tauri::Size::Logical(tauri::LogicalSize {
                            width: 399.0,
                            height: 399.0,
                        }))
                        .unwrap();
                    window.set_resizable(false).unwrap();
                    window.set_focus().unwrap();

                    window
                        .set_position(tauri::Position::Physical(tauri::PhysicalPosition {
                            x: screen_position.x + (screen_size.width - 399 * 2),
                            y: screen_position.y,
                        }))
                        .unwrap();
                } else {
                    let window = app.get_window("main").unwrap();
                    window.show().unwrap();
                    window.set_focus().unwrap();
                }
            }
            SystemTrayEvent::RightClick {
                position: _,
                size: _,
                ..
            } => {
                println!("system tray received a right click");
            }
            SystemTrayEvent::DoubleClick {
                position: _,
                size: _,
                ..
            } => {
                println!("system tray received a double click");
            }
            SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
                "quit" => {
                    std::process::exit(0);
                }
                _ => {}
            },
            _ => {}
        })
        .invoke_handler(tauri::generate_handler![])
        .build(tauri::generate_context!())
        .expect("error while running tauri application")
        .run(|_app_handle, event| match event {
            tauri::RunEvent::ExitRequested { api, .. } => {
                api.prevent_exit();
            }
            _ => {}
        });
}
